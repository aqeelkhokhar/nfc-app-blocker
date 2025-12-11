package com.nfcappblocker

import android.content.Context

object BlockedAppsStore {
    private const val PREF = "blocked_apps_store"
    private const val KEY_APPS = "apps"
    private const val KEY_ENABLED = "enabled"

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREF, Context.MODE_PRIVATE)

    fun add(context: Context, pkg: String) {
        val sp = prefs(context)
        val current = sp.getStringSet(KEY_APPS, emptySet()) ?: emptySet()
        val next = current.toMutableSet()
        next.add(pkg)
        sp.edit().putStringSet(KEY_APPS, next).apply()
    }

    fun remove(context: Context, pkg: String) {
        val sp = prefs(context)
        val current = sp.getStringSet(KEY_APPS, emptySet()) ?: emptySet()
        val next = current.toMutableSet()
        next.remove(pkg)
        sp.edit().putStringSet(KEY_APPS, next).apply()
    }

    fun setAll(context: Context, pkgs: Set<String>) {
        prefs(context).edit().putStringSet(KEY_APPS, pkgs.toSet()).apply()
    }

    fun getAll(context: Context): Set<String> {
        val sp = prefs(context)
        return sp.getStringSet(KEY_APPS, emptySet()) ?: emptySet()
    }

    fun setEnabled(context: Context, enabled: Boolean) {
        prefs(context).edit().putBoolean(KEY_ENABLED, enabled).apply()
    }

    fun isEnabled(context: Context): Boolean {
        return prefs(context).getBoolean(KEY_ENABLED, false)
    }
}
