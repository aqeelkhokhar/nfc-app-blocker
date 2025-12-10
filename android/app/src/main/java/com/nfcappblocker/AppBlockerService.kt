package com.nfcappblocker

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class AppBlockerService : AccessibilityService() {

    companion object {
        @Volatile
        var isEnabled = false
        @Volatile
        var blockedPackages = setOf<String>()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!isEnabled || event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        event.packageName?.toString()?.let { pkg ->
            if (blockedPackages.contains(pkg)) {
                performGlobalAction(GLOBAL_ACTION_HOME)
            }
        }
    }

    override fun onInterrupt() {}

    override fun onServiceConnected() {
        super.onServiceConnected()
    }
}
