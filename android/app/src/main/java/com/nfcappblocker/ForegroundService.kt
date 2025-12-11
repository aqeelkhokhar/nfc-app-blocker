package com.nfcappblocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.pm.PackageManager

class ForegroundService : Service() {
    private val NOTIFICATION_ID = 1
    private val NOTIFICATION_CHANNEL_ID = "app_blocker_service"
    private val CHECK_INTERVAL = 1000L // 1 second
    
    private val handler = Handler(Looper.getMainLooper())
    private var isRunning = false
    private lateinit var runnable: Runnable
    
    companion object {
        private const val TAG = "ForegroundService"
        const val ACTION_START_SERVICE = "ACTION_START_SERVICE"
        const val ACTION_STOP_SERVICE = "ACTION_STOP_SERVICE"
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
        
        createNotificationChannel()
        
        runnable = Runnable {
            if (isRunning) {
                checkCurrentApp()
                handler.postDelayed(runnable, CHECK_INTERVAL)
            }
        }
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_SERVICE -> startForegroundService()
            ACTION_STOP_SERVICE -> stopSelf()
        }
        
        // If service is killed, restart it
        return START_STICKY
    }
    
    private fun startForegroundService() {
        if (isRunning) return
        
        isRunning = true
        Log.d(TAG, "Starting foreground service")
        
        // Start the service as a foreground service with notification
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ requires a foreground service type
            startForeground(NOTIFICATION_ID, createNotification(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            // For older Android versions
            startForeground(NOTIFICATION_ID, createNotification())
        }
        
        // Begin monitoring apps
        handler.post(runnable)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacks(runnable)
        Log.d(TAG, "Service destroyed")
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "App Blocker Service"
            val descriptionText = "Keeps App Blocker running to block selected apps"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(NOTIFICATION_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        // Create an intent to open the main activity when notification is clicked
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent, 
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )
        
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("App Blocker is active")
            .setContentText("Monitoring for blocked apps")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setSilent(true)
            .setOngoing(true)
            .build()
    }
    
    private fun checkCurrentApp() {
        if (!AppBlockerService.isEnabled) {
            // App blocking not enabled, nothing to do
            return
        }
        
        try {
            val currentApp = getForegroundApp()
            if (currentApp != null && AppBlockerService.blockedPackages.contains(currentApp)) {
                if (AppBlockerService.isServiceEnabled()) {
                    // Let the accessibility service handle the blocking
                    Log.d(TAG, "Detected blocked app in foreground: $currentApp, letting accessibility service handle it")
                } else {
                    // Accessibility service not enabled, try to launch our app
                    Log.d(TAG, "Detected blocked app but accessibility service not enabled, launching our app instead")
                    launchOurApp()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking current app", e)
        }
    }
    
    private fun getForegroundApp(): String? {
        try {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return null
            
            // Get usage events
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 5000 // last 5 seconds
            
            val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
            
            var lastForegroundPackageName: String? = null
            val event = UsageEvents.Event()
            
            // Find the most recent foreground event
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event)
                if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    lastForegroundPackageName = event.packageName.toString()
                }
            }
            
            return lastForegroundPackageName
        } catch (e: Exception) {
            Log.e(TAG, "Error getting foreground app", e)
            return null
        }
    }
    
    private fun launchOurApp() {
        try {
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (intent != null) {
                startActivity(intent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error launching our app", e)
        }
    }
}
