package com.example.aod.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "aod_settings")

enum class AodMode { ALWAYS, TIMEOUT, SINGLE_TAP, SCHEDULED }
enum class DisplayType { CLOCK, TEXT, IMAGE }

class SettingsRepository(context: Context) {
    private val dataStore = context.dataStore

    companion object {
        val AOD_MODE = stringPreferencesKey("aod_mode")
        val TIMEOUT_DURATION = intPreferencesKey("timeout_duration")
        val START_TIME = stringPreferencesKey("start_time")
        val END_TIME = stringPreferencesKey("end_time")
        val DISPLAY_TYPE = stringPreferencesKey("display_type")
        val CUSTOM_TEXT = stringPreferencesKey("custom_text")
        val CUSTOM_IMAGE_URI = stringPreferencesKey("custom_image_uri")
        val COLOR = longPreferencesKey("color")
    }

    val aodModeFlow: Flow<AodMode> = dataStore.data.map { prefs ->
        AodMode.valueOf(prefs[AOD_MODE] ?: AodMode.TIMEOUT.name)
    }

    val timeoutDurationFlow: Flow<Int> = dataStore.data.map { prefs ->
        prefs[TIMEOUT_DURATION] ?: 2
    }

    val displayTypeFlow: Flow<DisplayType> = dataStore.data.map { prefs ->
        DisplayType.valueOf(prefs[DISPLAY_TYPE] ?: DisplayType.CLOCK.name)
    }

    val customTextFlow: Flow<String> = dataStore.data.map { prefs ->
        prefs[CUSTOM_TEXT] ?: "Always On"
    }

    val customImageUriFlow: Flow<String?> = dataStore.data.map { prefs ->
        prefs[CUSTOM_IMAGE_URI]
    }
    
    val colorFlow: Flow<Long> = dataStore.data.map { prefs ->
        prefs[COLOR] ?: 0xFFFFFFFFL // Default white
    }

    suspend fun updateAodMode(mode: AodMode) {
        dataStore.edit { it[AOD_MODE] = mode.name }
    }

    suspend fun updateDisplayType(type: DisplayType) {
        dataStore.edit { it[DISPLAY_TYPE] = type.name }
    }

    suspend fun updateTimeoutDuration(minutes: Int) {
        dataStore.edit { it[TIMEOUT_DURATION] = minutes }
    }

    suspend fun updateCustomText(text: String) {
        dataStore.edit { it[CUSTOM_TEXT] = text }
    }
    
    suspend fun updateCustomImageUri(uri: String) {
        dataStore.edit { it[CUSTOM_IMAGE_URI] = uri }
    }

    suspend fun updateColor(color: Long) {
        dataStore.edit { it[COLOR] = color }
    }
}
