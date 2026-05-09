package com.example.aod.receiver

import android.app.ActivityOptions
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.aod.data.AodMode
import com.example.aod.data.SettingsRepository
import com.example.aod.ui.AodActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ScreenReceiver : BroadcastReceiver() {
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val repository = SettingsRepository(context)

        scope.launch {
            val mode = repository.aodModeFlow.first()
            val action = intent.action

            val shouldLaunch = when (mode) {
                AodMode.ALWAYS, AodMode.TIMEOUT -> action == Intent.ACTION_SCREEN_OFF
                AodMode.SINGLE_TAP -> action == Intent.ACTION_SCREEN_ON
                AodMode.SCHEDULED -> action == Intent.ACTION_SCREEN_OFF // Assumes scheduling verification
            }

            if (shouldLaunch) {
                launchAodActivity(context)
            }
        }
    }

    private fun launchAodActivity(context: Context) {
        val aodIntent = Intent(context, AodActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        
        // Critical: Bypass Android 16 background activity start restrictions
        val options = ActivityOptions.makeBasic().apply {
            setPendingIntentBackgroundActivityStartMode(ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED)
        }
        
        context.startActivity(aodIntent, options.toBundle())
    }
}
