package com.nfcappblocker

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "InstalledAppsModule"

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val apps = Arguments.createArray()
            
            // METHOD 1: Get installed apps through Intent query (finds more user apps)
            val mainIntent = Intent(Intent.ACTION_MAIN, null)
            mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
            val launcherApps = pm.queryIntentActivities(mainIntent, 0)
            
            // Track apps we've already added to avoid duplicates
            val processedPackages = HashSet<String>()
            
            // Process launcher apps first (these are the ones users mostly care about)
            for (resolveInfo in launcherApps) {
                val packageName = resolveInfo.activityInfo.packageName
                
                // Skip duplicates
                if (processedPackages.contains(packageName)) {
                    continue
                }
                processedPackages.add(packageName)
                
                val app = Arguments.createMap()
                val appName = resolveInfo.loadLabel(pm).toString()
                
                app.putString("id", packageName)
                app.putString("name", appName)
                app.putString("platform", "android")
                
                // Get app icon as base64
                try {
                    val icon = resolveInfo.activityInfo.loadIcon(pm)
                    val base64Icon = convertDrawableToBase64(icon)
                    if (base64Icon != null) {
                        app.putString("icon", base64Icon)
                    }
                } catch (e: Exception) {
                    // Icon couldn't be loaded, continue without it
                }
                
                // Check if it's Facebook, LinkedIn or other popular apps - for debugging
                if (packageName.contains("facebook") || packageName.contains("linkedin") || 
                    packageName.contains("instagram") || packageName.contains("whatsapp") ||
                    packageName.contains("twitter") || packageName.contains("snapchat")) {
                    Log.d("InstalledAppsModule", "Found popular app: $packageName ($appName)")
                }
                
                apps.pushMap(app)
            }
            
            // METHOD 2: Get ALL installed packages (backup to catch any missed apps)
            val installedPackages = pm.getInstalledPackages(0)
            for (packageInfo in installedPackages) {
                val packageName = packageInfo.packageName
                
                // Skip already processed packages
                if (processedPackages.contains(packageName)) {
                    continue
                }
                
                // Check if this package has a launch intent
                val launchIntent = pm.getLaunchIntentForPackage(packageName)
                if (launchIntent == null) {
                    // For popular apps, include them even if they don't have a direct launch intent
                    if (!packageName.contains("facebook") && !packageName.contains("linkedin") && 
                        !packageName.contains("instagram") && !packageName.contains("whatsapp") &&
                        !packageName.contains("twitter") && !packageName.contains("snapchat")) {
                        continue
                    }
                }
                
                processedPackages.add(packageName)
                
                // Create app data
                val app = Arguments.createMap()
                try {
                    val appInfo = pm.getApplicationInfo(packageName, 0)
                    val appName = pm.getApplicationLabel(appInfo).toString()
                    
                    app.putString("id", packageName)
                    app.putString("name", appName)
                    app.putString("platform", "android")
                    
                    // Get app icon as base64
                    try {
                        val icon = pm.getApplicationIcon(packageName)
                        val base64Icon = convertDrawableToBase64(icon)
                        if (base64Icon != null) {
                            app.putString("icon", base64Icon)
                        }
                    } catch (e: Exception) {
                        // Icon couldn't be loaded, continue without it
                    }
                    
                    // If it's a popular app, log it
                    if (packageName.contains("facebook") || packageName.contains("linkedin") || 
                        packageName.contains("instagram") || packageName.contains("whatsapp") ||
                        packageName.contains("twitter") || packageName.contains("snapchat")) {
                        Log.d("InstalledAppsModule", "Found popular app (method 2): $packageName ($appName)")
                    }
                    
                    apps.pushMap(app)
                } catch (e: Exception) {
                    // Skip apps we can't get info for
                    continue
                }
            }
            
            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error getting installed apps")
        }
    }
    
    private fun convertDrawableToBase64(drawable: Drawable): String? {
        try {
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth,
                drawable.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
            
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val byteArray = stream.toByteArray()
            return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.DEFAULT)
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }
}
