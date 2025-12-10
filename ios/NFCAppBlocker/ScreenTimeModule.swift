import Foundation
import FamilyControls
import ManagedSettings
import SwiftUI
import React
import UIKit

@available(iOS 16.0, *)
struct ActivityPickerView: View {
  @Environment(\.dismiss) private var dismiss
  @State private var selection = FamilyActivitySelection()
  let completion: (FamilyActivitySelection?) -> Void

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Select Apps to Block")
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button("Cancel") {
              completion(nil)
              dismiss()
            }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") {
              completion(selection)
              dismiss()
            }
          }
        }
    }
  }
}

@objc(ScreenTimeModule)
class ScreenTimeModule: NSObject {
  private let store = ManagedSettingsStore()
  private var cachedSelection: FamilyActivitySelection?

  private var pickerResolve: RCTPromiseResolveBlock?
  private var pickerReject: RCTPromiseRejectBlock?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    // Screen Time API and UI interactions must run on main queue
    return true
  }

  // MARK: - Authorization

  @objc(requestAuthorization:rejecter:)
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else {
      reject("E_UNSUPPORTED", "Screen Time API requires iOS 16 or later", nil)
      return
    }

    Task { @MainActor in
      do {
        let center = AuthorizationCenter.shared

        switch center.authorizationStatus {
        case .approved:
          resolve("approved")
          return
        case .denied:
          resolve("denied")
          return
        case .notDetermined:
          break
        @unknown default:
          break
        }

        try await center.requestAuthorization(for: .individual)

        switch center.authorizationStatus {
        case .approved:
          resolve("approved")
        case .denied:
          resolve("denied")
        case .notDetermined:
          resolve("notDetermined")
        @unknown default:
          resolve("unknown")
        }
      } catch {
        reject("E_AUTH", "Failed to request Screen Time authorization", error)
      }
    }
  }

  // MARK: - FamilyActivityPicker

  @objc(presentPicker:rejecter:)
  func presentPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else {
      reject("E_UNSUPPORTED", "Screen Time API requires iOS 16 or later", nil)
      return
    }

    if pickerResolve != nil {
      reject("E_BUSY", "FamilyActivityPicker is already presented", nil)
      return
    }

    // All UIKit/SwiftUI presentation must happen on the main thread
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }

      guard let rootVC = ScreenTimeModule.findRootViewController() else {
        reject("E_NO_ROOT", "Unable to find root view controller to present picker", nil)
        return
      }

      self.pickerResolve = resolve
      self.pickerReject = reject

      let hosting = UIHostingController(rootView: ActivityPickerView { [weak self] selection in
        guard let self else { return }

        let resolveBlock = self.pickerResolve
        let rejectBlock = self.pickerReject
        self.pickerResolve = nil
        self.pickerReject = nil

        guard let selection else {
          // User cancelled
          resolveBlock?(NSNull())
          return
        }

        do {
          let data = try JSONEncoder().encode(selection)
          let encoded = data.base64EncodedString()
          self.cachedSelection = selection
          resolveBlock?(encoded)
        } catch {
          rejectBlock?("E_ENCODE", "Failed to encode FamilyActivitySelection", error)
        }
      })

      hosting.modalPresentationStyle = .formSheet
      rootVC.present(hosting, animated: true)
    }
  }

  // MARK: - Shield configuration

  @objc(setBlockingEnabled:selectionData:resolver:rejecter:)
  func setBlockingEnabled(_ enabled: Bool,
                          selectionData: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.0, *) else {
      reject("E_UNSUPPORTED", "Screen Time API requires iOS 16 or later", nil)
      return
    }

    do {
      let selection: FamilyActivitySelection

      if let cachedSelection {
        selection = cachedSelection
      } else {
        guard let data = Data(base64Encoded: selectionData) else {
          reject("E_DECODE", "selectionData is not valid base64", nil)
          return
        }
        selection = try JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        cachedSelection = selection
      }

      if enabled {
        let apps = selection.applicationTokens
        let categories = selection.categoryTokens
        let webDomains = selection.webDomainTokens

        store.shield.applications = apps.isEmpty ? nil : apps
        store.shield.applicationCategories = categories.isEmpty
          ? nil
          : ShieldSettings.ActivityCategoryPolicy.specific(categories)
        store.shield.webDomains = webDomains.isEmpty ? nil : webDomains
      } else {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
      }

      resolve(NSNull())
    } catch {
      reject("E_DECODE", "Failed to decode FamilyActivitySelection", error)
    }
  }

  // MARK: - Helpers

  private static func findRootViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }

    // Prefer the foreground active scene
    if let activeScene = scenes.first(where: { $0.activationState == .foregroundActive }) {
      if let root = activeScene.keyWindow?.rootViewController {
        return root
      }
      if let root = activeScene.windows.first(where: { $0.isKeyWindow })?.rootViewController {
        return root
      }
    }

    // Fallback: any scene's key window
    for scene in scenes {
      if let root = scene.keyWindow?.rootViewController {
        return root
      }
      if let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController {
        return root
      }
    }

    return nil
  }
}
