package com.nasyxrakeeb.m3e

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class M3EDynamicColorPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? =
    if (name == NativeM3EDynamicColorSpec.NAME) {
      M3EDynamicColorModule(reactContext)
    } else {
      null
    }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider {
      mapOf(
        NativeM3EDynamicColorSpec.NAME to ReactModuleInfo(
          NativeM3EDynamicColorSpec.NAME,
          M3EDynamicColorModule::class.java.name,
          false,
          false,
          false,
          true,
        ),
      )
    }
}
