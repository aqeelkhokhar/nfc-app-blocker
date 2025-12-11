package com.nfcappblocker

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val TAG = "AppBlockerModule"
    }

    override fun getName() = "AppBlockerModule"

    @ReactMethod
    fun setBlockingEnabled(enabled: Boolean, promise: Promise) {
        try {
            AppBlockerService.isEnabled = enabled
            Log.d(TAG, "App blocking ${if (enabled) "enabled" else "disabled"}")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting blocking enabled", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setBlockedPackages(packages: ReadableArray, promise: Promise) {
        try {
            val blockedPackages = (0 until packages.size())
                .mapNotNull { packages.getString(it) }
                .toSet()
            
            AppBlockerService.blockedPackages = blockedPackages
            Log.d(TAG, "Blocked packages updated: ${blockedPackages.joinToString()}")
            AppBlockerService.logBlockedPackages()
            
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting blocked packages", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }


}
