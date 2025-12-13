package com.nfcappblocker

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class BlockOverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private var isOverlayShowing = false
    private val handler = Handler(Looper.getMainLooper())
    
    companion object {
        private const val TAG = "BlockOverlayService"
        private var instance: BlockOverlayService? = null
        private var appNameToBlock: String? = null

        fun getInstance(): BlockOverlayService? = instance
        
        fun setAppToBlock(appName: String) {
            appNameToBlock = appName
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "BlockOverlayService created")
        instance = this
        
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        
        // Inflate the overlay view
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        overlayView = inflater.inflate(R.layout.block_overlay, null)
        
        // Set up close button
        val btnClose = overlayView.findViewById<Button>(R.id.btn_close)
        btnClose.setOnClickListener {
            hideOverlay()
            performGlobalActionHome()
        }
    }
    
    private fun performGlobalActionHome() {
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory(Intent.CATEGORY_HOME)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "BlockOverlayService onStartCommand")
        return START_STICKY
    }
    
    fun showOverlay(packageName: String, appName: String? = null) {
        if (!Settings.canDrawOverlays(this)) {
            Log.e(TAG, "Cannot show overlay without permission")
            return
        }
        
        if (isOverlayShowing) {
            return
        }
        
        handler.post {
            try {
                Log.d(TAG, "Showing block overlay for $packageName")
                
                val displayName = appName ?: packageName
                val tvAppName = overlayView.findViewById<TextView>(R.id.tv_blocked_app_name)
                tvAppName.text = displayName
                val tvMessage = overlayView.findViewById<TextView>(R.id.tv_blocked_message)
                tvMessage.text = "This app is blocked right now. Go back to Home to stay on track."
                
                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else
                        WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                            WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                    PixelFormat.TRANSLUCENT
                )
                
                layoutParams.gravity = Gravity.CENTER
                windowManager.addView(overlayView, layoutParams)
                isOverlayShowing = true
                
            } catch (e: Exception) {
                Log.e(TAG, "Error showing overlay", e)
            }
        }
    }
    
    fun hideOverlay() {
        if (!isOverlayShowing) return
        
        handler.post {
            try {
                windowManager.removeView(overlayView)
                isOverlayShowing = false
            } catch (e: Exception) {
                Log.e(TAG, "Error hiding overlay", e)
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        if (isOverlayShowing) {
            hideOverlay()
        }
        instance = null
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
}
