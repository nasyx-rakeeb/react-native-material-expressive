package com.nasyxrakeeb.m3e

import android.content.Context
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import org.json.JSONObject
import java.util.Locale

/**
 * Reads Android's Material You dynamic palette.
 *
 * API 31-33 expose 13 tones per tonal range. Compose's dynamic scheme derives
 * the intermediate surface tones in Kotlin from the 40-tone, so this module
 * returns the raw tones and lets TypeScript perform the same derivation.
 *
 * API 34+ exposes complete light/dark role resources. The error roles and
 * scrim are not part of that resource set; Compose fills them from its static
 * baseline and the TypeScript parser does the same.
 */
class M3EDynamicColorModule(reactContext: ReactApplicationContext) :
    NativeM3EDynamicColorSpec(reactContext) {

  override fun getDynamicColorPayload(promise: Promise) {
    try {
      val apiLevel = Build.VERSION.SDK_INT
      val payload = when {
        apiLevel < Build.VERSION_CODES.S -> JSONObject()
          .put("kind", "unsupported")
          .put("apiLevel", apiLevel)

        apiLevel >= 34 -> JSONObject()
          .put("kind", "roles")
          .put("apiLevel", apiLevel)
          .put("light", readRoles(reactApplicationContext, isDark = false))
          .put("dark", readRoles(reactApplicationContext, isDark = true))

        else -> JSONObject()
          .put("kind", "tones")
          .put("apiLevel", apiLevel)
          .put("tones", readTones(reactApplicationContext))
      }
      promise.resolve(payload.toString())
    } catch (error: Throwable) {
      promise.reject("E_M3E_DYNAMIC_COLOR", "Unable to read dynamic colours", error)
    }
  }

  private fun readTones(context: Context): JSONObject {
    val tones = JSONObject()
    tones.put("primary", readToneRange(context, "accent1"))
    tones.put("secondary", readToneRange(context, "accent2"))
    tones.put("tertiary", readToneRange(context, "accent3"))
    tones.put("neutral", readToneRange(context, "neutral1"))
    tones.put("neutralVariant", readToneRange(context, "neutral2"))
    return tones
  }

  private fun readToneRange(context: Context, range: String): JSONObject {
    val result = JSONObject()
    for ((tone, suffix) in TONE_RESOURCES) {
      val color = readColor(context, "system_${range}_$suffix")
      result.put(tone.toString(), color)
    }
    return result
  }

  private fun readRoles(context: Context, isDark: Boolean): JSONObject {
    val result = JSONObject()
    for (resource in ROLE_RESOURCES) {
      val name = if (isDark) resource.dark else resource.light
      result.put(resource.role, readColor(context, name))
    }
    return result
  }

  private fun readColor(context: Context, name: String): String {
    val id = context.resources.getIdentifier(name, "color", "android")
    check(id != 0) { "Android colour resource $name is unavailable on API ${Build.VERSION.SDK_INT}" }
    return String.format(Locale.US, "#%06X", 0xFFFFFF and context.getColor(id))
  }

  private data class ToneResource(val tone: Int, val suffix: Int)

  private data class RoleResource(val role: String, val light: String, val dark: String)

  private companion object {
    /**
     * Android exposes the Material tonal ranges at these resource suffixes.
     * The names are reversed relative to tone: `_1000` is tone 0 and `_0` is
     * tone 100.
     */
    val TONE_RESOURCES = listOf(
      ToneResource(0, 1000),
      ToneResource(10, 900),
      ToneResource(20, 800),
      ToneResource(30, 700),
      ToneResource(40, 600),
      ToneResource(50, 500),
      ToneResource(60, 400),
      ToneResource(70, 300),
      ToneResource(80, 200),
      ToneResource(90, 100),
      ToneResource(95, 50),
      ToneResource(99, 10),
      ToneResource(100, 0),
    )

    val ROLE_RESOURCES = listOf(
      RoleResource("primary", "system_primary_light", "system_primary_dark"),
      RoleResource("onPrimary", "system_on_primary_light", "system_on_primary_dark"),
      RoleResource(
        "primaryContainer",
        "system_primary_container_light",
        "system_primary_container_dark",
      ),
      RoleResource(
        "onPrimaryContainer",
        "system_on_primary_container_light",
        "system_on_primary_container_dark",
      ),
      RoleResource("inversePrimary", "system_primary_dark", "system_primary_light"),
      RoleResource("secondary", "system_secondary_light", "system_secondary_dark"),
      RoleResource("onSecondary", "system_on_secondary_light", "system_on_secondary_dark"),
      RoleResource(
        "secondaryContainer",
        "system_secondary_container_light",
        "system_secondary_container_dark",
      ),
      RoleResource(
        "onSecondaryContainer",
        "system_on_secondary_container_light",
        "system_on_secondary_container_dark",
      ),
      RoleResource("tertiary", "system_tertiary_light", "system_tertiary_dark"),
      RoleResource("onTertiary", "system_on_tertiary_light", "system_on_tertiary_dark"),
      RoleResource(
        "tertiaryContainer",
        "system_tertiary_container_light",
        "system_tertiary_container_dark",
      ),
      RoleResource(
        "onTertiaryContainer",
        "system_on_tertiary_container_light",
        "system_on_tertiary_container_dark",
      ),
      RoleResource("background", "system_background_light", "system_background_dark"),
      RoleResource("onBackground", "system_on_background_light", "system_on_background_dark"),
      RoleResource("surface", "system_surface_light", "system_surface_dark"),
      RoleResource("onSurface", "system_on_surface_light", "system_on_surface_dark"),
      RoleResource(
        "surfaceVariant",
        "system_surface_variant_light",
        "system_surface_variant_dark",
      ),
      RoleResource(
        "onSurfaceVariant",
        "system_on_surface_variant_light",
        "system_on_surface_variant_dark",
      ),
      RoleResource("inverseSurface", "system_surface_dark", "system_surface_light"),
      RoleResource(
        "inverseOnSurface",
        "system_on_surface_dark",
        "system_on_surface_light",
      ),
      RoleResource("outline", "system_outline_light", "system_outline_dark"),
      RoleResource("outlineVariant", "system_outline_variant_light", "system_outline_variant_dark"),
      RoleResource("surfaceBright", "system_surface_bright_light", "system_surface_bright_dark"),
      RoleResource("surfaceDim", "system_surface_dim_light", "system_surface_dim_dark"),
      RoleResource("surfaceContainer", "system_surface_container_light", "system_surface_container_dark"),
      RoleResource(
        "surfaceContainerHigh",
        "system_surface_container_high_light",
        "system_surface_container_high_dark",
      ),
      RoleResource(
        "surfaceContainerHighest",
        "system_surface_container_highest_light",
        "system_surface_container_highest_dark",
      ),
      RoleResource(
        "surfaceContainerLow",
        "system_surface_container_low_light",
        "system_surface_container_low_dark",
      ),
      RoleResource(
        "surfaceContainerLowest",
        "system_surface_container_lowest_light",
        "system_surface_container_lowest_dark",
      ),
      RoleResource("surfaceTint", "system_primary_light", "system_primary_dark"),
      RoleResource("primaryFixed", "system_primary_fixed", "system_primary_fixed"),
      RoleResource("primaryFixedDim", "system_primary_fixed_dim", "system_primary_fixed_dim"),
      RoleResource("onPrimaryFixed", "system_on_primary_fixed", "system_on_primary_fixed"),
      RoleResource(
        "onPrimaryFixedVariant",
        "system_on_primary_fixed_variant",
        "system_on_primary_fixed_variant",
      ),
      RoleResource("secondaryFixed", "system_secondary_fixed", "system_secondary_fixed"),
      RoleResource(
        "secondaryFixedDim",
        "system_secondary_fixed_dim",
        "system_secondary_fixed_dim",
      ),
      RoleResource("onSecondaryFixed", "system_on_secondary_fixed", "system_on_secondary_fixed"),
      RoleResource(
        "onSecondaryFixedVariant",
        "system_on_secondary_fixed_variant",
        "system_on_secondary_fixed_variant",
      ),
      RoleResource("tertiaryFixed", "system_tertiary_fixed", "system_tertiary_fixed"),
      RoleResource("tertiaryFixedDim", "system_tertiary_fixed_dim", "system_tertiary_fixed_dim"),
      RoleResource("onTertiaryFixed", "system_on_tertiary_fixed", "system_on_tertiary_fixed"),
      RoleResource(
        "onTertiaryFixedVariant",
        "system_on_tertiary_fixed_variant",
        "system_on_tertiary_fixed_variant",
      ),
    )
  }
}
