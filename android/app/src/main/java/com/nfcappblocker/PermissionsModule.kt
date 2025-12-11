package com.nfcappblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.*

class PermissionsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "PermissionsModule"
    
    override fun getName() = "PermissionsModule"
    
    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        val hasPermission = Settings.canDrawOverlays(reactContext)
        promise.resolve(hasPermission)
    }
    
    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactContext.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            val currentActivity = reactContext.currentActivity
            if (currentActivity != null) {
                currentActivity.startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE)
                PermissionCallback.overlayPromise = promise
            } else {
                reactContext.startActivity(intent)
                promise.resolve(false) // Can't get result without activity
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting overlay permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to request overlay permission")
        }
    }
    
    @ReactMethod
    fun checkUsageStatsPermission(promise: Promise) {
        val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            reactContext.packageName
        )
        val hasPermission = mode == AppOpsManager.MODE_ALLOWED
        promise.resolve(hasPermission)
    }
    
    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            val currentActivity = reactContext.currentActivity
            if (currentActivity != null) {
                currentActivity.startActivityForResult(intent, USAGE_PERMISSION_REQ_CODE)
                PermissionCallback.usagePromise = promise
            } else {
                reactContext.startActivity(intent)
                promise.resolve(false) // Can't get result without activity
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting usage stats permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to request usage stats permission")
        }
    }
    
    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        val accessibilityEnabled = AppBlockerService.isServiceEnabled()
        promise.resolve(accessibilityEnabled)
    }
    
    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            // Create a specific intent that opens our exact accessibility service
            val packageName = reactContext.packageName
            val componentName = "$packageName/$packageName.AppBlockerService"
            
            val intentSpecific = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            // This extra tells the settings to open the specific service
            intentSpecific.putExtra(":settings:fragment_args_key", componentName)
            intentSpecific.putExtra(":settings:show_fragment_args", true)
            intentSpecific.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            // First try the specific intent to directly open our service
            try {
                // If device supports direct navigation
                val currentActivity = reactContext.currentActivity
                if (currentActivity != null) {
                    currentActivity.startActivityForResult(intentSpecific, ACCESSIBILITY_PERMISSION_REQ_CODE)
                    PermissionCallback.accessibilityPromise = promise
                } else {
                    reactContext.startActivity(intentSpecific)
                    promise.resolve(false) // Can't get result without activity
                }
                return
            } catch (e: Exception) {
                Log.e(TAG, "Could not open specific accessibility settings, falling back to general settings", e)
                // Fall back to general accessibility settings
                val intentGeneral = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                intentGeneral.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                
                val currentActivity = reactContext.currentActivity
                if (currentActivity != null) {
                    currentActivity.startActivityForResult(intentGeneral, ACCESSIBILITY_PERMISSION_REQ_CODE)
                    PermissionCallback.accessibilityPromise = promise
                } else {
                    reactContext.startActivity(intentGeneral)
                    promise.resolve(false) // Can't get result without activity
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting accessibility permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to request accessibility permission")
        }
    }
    
    companion object {
        private const val OVERLAY_PERMISSION_REQ_CODE = 1234
        private const val USAGE_PERMISSION_REQ_CODE = 2345
        private const val ACCESSIBILITY_PERMISSION_REQ_CODE = 3456
    }
    
    object PermissionCallback {
        var overlayPromise: Promise? = null
        var usagePromise: Promise? = null
        var accessibilityPromise: Promise? = null
    }
}
