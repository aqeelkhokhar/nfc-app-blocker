package com.nfcappblocker

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    private const val OVERLAY_PERMISSION_REQ_CODE = 1234
    private const val USAGE_PERMISSION_REQ_CODE = 2345
    private const val ACCESSIBILITY_PERMISSION_REQ_CODE = 3456
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NFCAppBlocker"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    
    when (requestCode) {
      OVERLAY_PERMISSION_REQ_CODE -> {
        val hasPermission = Settings.canDrawOverlays(this)
        PermissionsModule.PermissionCallback.overlayPromise?.resolve(hasPermission)
        PermissionsModule.PermissionCallback.overlayPromise = null
      }
      
      USAGE_PERMISSION_REQ_CODE -> {
        // We can't directly check if permission was granted from result code
        // so we check again using the UsageStatsManager
        val appOps = getSystemService(APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOps.checkOpNoThrow(
          android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          packageName
        )
        val hasPermission = mode == android.app.AppOpsManager.MODE_ALLOWED
        PermissionsModule.PermissionCallback.usagePromise?.resolve(hasPermission)
        PermissionsModule.PermissionCallback.usagePromise = null
      }
      
      ACCESSIBILITY_PERMISSION_REQ_CODE -> {
        // Since we can't know if accessibility was enabled from the result,
        // we just return the current state from our service
        val isEnabled = AppBlockerService.isServiceEnabled()
        PermissionsModule.PermissionCallback.accessibilityPromise?.resolve(isEnabled)
        PermissionsModule.PermissionCallback.accessibilityPromise = null
      }
    }
  }
}
