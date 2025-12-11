package com.nfcappblocker

import android.accessibilityservice.AccessibilityService
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

class AppBlockerService : AccessibilityService() {

    private val handler = Handler(Looper.getMainLooper())
    private var blockCheck: Runnable? = null
    private var lastBlockedPackage = ""
    private var consecutiveBlockCount = 0

    companion object {
        private const val TAG = "AppBlockerService"
        private const val BLOCK_CHECK_INTERVAL = 200L // ms
        private const val MAX_CONSECUTIVE_BLOCKS = 5
        
        @Volatile
        var isEnabled = false
        
        @Volatile
        var blockedPackages = setOf<String>()

        private var isServiceConnected = false
        
        fun logBlockedPackages() {
            Log.d(TAG, "Currently blocked packages: ${blockedPackages.joinToString()}")
        }

        fun isServiceEnabled(): Boolean {
            return isServiceConnected
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        
        // Check native-enabled flag so blocking survives JS/app process death
        if (!BlockedAppsStore.isEnabled(this)) {
            return
        }

        // Check for window state changes (app opening)
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            // Get the package name of the current app
            val packageName = event.packageName?.toString() ?: return

            val blocked = BlockedAppsStore.getAll(this)
            if (blocked.contains(packageName)) {
                blockApp(packageName)
            }
        }
    }

    private fun blockApp(packageName: String) {
        if (packageName == lastBlockedPackage) {
            consecutiveBlockCount++
            if (consecutiveBlockCount > MAX_CONSECUTIVE_BLOCKS) {
                // If we're repeatedly blocking the same app, add a small delay
                // to prevent excessive CPU usage
                Log.d(TAG, "Too many consecutive blocks for $packageName, adding delay")
                handler.postDelayed({ performBlockAction(packageName) }, 500)
                return
            }
        } else {
            consecutiveBlockCount = 0
            lastBlockedPackage = packageName
        }

        performBlockAction(packageName)

        // Schedule another check to ensure the app stays blocked
        scheduleFollowUpCheck(packageName)
    }

    private fun performBlockAction(packageName: String) {
        Log.d(TAG, "Blocking access to app: $packageName")
        
        // First try to show the overlay if we have permission
        if (Settings.canDrawOverlays(this)) {
            // Start the overlay service if it's not already running
            val overlayIntent = Intent(this, BlockOverlayService::class.java)
            startService(overlayIntent)
            
            // Get app name for better display
            val appName = try {
                val pm = packageManager
                pm.getApplicationInfo(packageName, 0).loadLabel(pm).toString()
            } catch (e: Exception) {
                packageName
            }
            
            // Show the overlay
            val overlayService = BlockOverlayService.getInstance()
            if (overlayService != null) {
                overlayService.showOverlay(packageName, appName)
            } else {
                Log.e(TAG, "Overlay service not available")
                // Fallback to home action
                performGlobalAction(GLOBAL_ACTION_HOME)
            }
        } else {
            // No overlay permission, fall back to toast + home action
            try {
                Toast.makeText(this, "App blocked by App Blocker", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Log.e(TAG, "Error showing toast", e)
            }
            
            // Send user to home screen
            performGlobalAction(GLOBAL_ACTION_HOME)
        }
    }

    private fun scheduleFollowUpCheck(packageName: String) {
        // Cancel existing check if there is one
        blockCheck?.let { handler.removeCallbacks(it) }
        
        // Create a new check that verifies the blocked app isn't still in foreground
        blockCheck = Runnable {
            checkCurrentAppWithUsageStats(packageName)
        }
        
        // Schedule the check
        handler.postDelayed(blockCheck!!, BLOCK_CHECK_INTERVAL)
    }

    private fun checkCurrentAppWithUsageStats(blockedPackage: String) {
        try {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
            
            // Query recent usage events
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 2000 // Last 2 seconds
            
            val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
            val event = UsageEvents.Event()
            var currentForeground: String? = null
            
            // Find the most recent foreground event
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event)
                if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    currentForeground = event.packageName.toString()
                }
            }
            
            // If the blocked app is still in foreground, block it again
            if (currentForeground == blockedPackage) {
                Log.d(TAG, "Follow-up check: $blockedPackage is still in foreground, blocking again")
                blockApp(blockedPackage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking current app with usage stats", e)
        }
    }

    override fun onInterrupt() {}

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceConnected = true
        Log.d(TAG, "AppBlockerService connected")
        logBlockedPackages()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        isServiceConnected = false
        Log.d(TAG, "AppBlockerService destroyed")
        
        // Clean up handler callbacks
        blockCheck?.let { handler.removeCallbacks(it) }
    }
}
