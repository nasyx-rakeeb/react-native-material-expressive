package com.nasyxrakeeb.m3ereference

import androidx.compose.animation.core.AnimationVector1D
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.SpringSpec
import androidx.compose.animation.core.VectorConverter
import androidx.compose.animation.core.VectorizedFiniteAnimationSpec
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.MotionScheme
import org.junit.Test
import java.io.File
import java.util.Locale

/**
 * Dumps every Material3 1.5.0 `MotionScheme` spring as a numeric trace.
 *
 * This is the Day 8 reference for the TypeScript spring solver. The trace is taken through the
 * public `MotionScheme` API and `FiniteAnimationSpec.vectorize(Float.VectorConverter)`, i.e. the
 * same path components use, so the golden covers token values, visibility threshold, duration
 * estimation, and the closed-form solution together.
 *
 * The output is copied to docs/specs/motion/goldens.json by tools/motion/generate-goldens.sh.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
class SpringGoldenTest {
    private data class SpringCase(
        val name: String,
        val scheme: String,
        val spec: FiniteAnimationSpec<Float>,
    )

    private fun springCases(): List<SpringCase> {
        val standard = MotionScheme.standard()
        val expressive = MotionScheme.expressive()
        return listOf(
            SpringCase("defaultSpatial", "standard", standard.defaultSpatialSpec()),
            SpringCase("fastSpatial", "standard", standard.fastSpatialSpec()),
            SpringCase("slowSpatial", "standard", standard.slowSpatialSpec()),
            SpringCase("defaultEffects", "standard", standard.defaultEffectsSpec()),
            SpringCase("fastEffects", "standard", standard.fastEffectsSpec()),
            SpringCase("slowEffects", "standard", standard.slowEffectsSpec()),
            SpringCase("defaultSpatial", "expressive", expressive.defaultSpatialSpec()),
            SpringCase("fastSpatial", "expressive", expressive.fastSpatialSpec()),
            SpringCase("slowSpatial", "expressive", expressive.slowSpatialSpec()),
            SpringCase("defaultEffects", "expressive", expressive.defaultEffectsSpec()),
            SpringCase("fastEffects", "expressive", expressive.fastEffectsSpec()),
            SpringCase("slowEffects", "expressive", expressive.slowEffectsSpec()),
        )
    }

    private val initial = AnimationVector1D(0f)
    private val target = AnimationVector1D(1f)

    private fun number(value: Float): String = String.format(Locale.ROOT, "%.9f", value)

    private fun vectorized(
        spec: FiniteAnimationSpec<Float>,
    ): VectorizedFiniteAnimationSpec<AnimationVector1D> =
        spec.vectorize(Float.VectorConverter)

    private fun velocity(velocity: Float) = AnimationVector1D(velocity)

    private fun appendTrace(
        out: StringBuilder,
        spec: FiniteAnimationSpec<Float>,
        initialVelocity: Float,
        indent: String,
    ) {
        val anim = vectorized(spec)
        val durationNanos = anim.getDurationNanos(initial, target, velocity(initialVelocity))
        val durationMs = durationNanos / 1_000_000L
        out.append("${indent}\"durationMs\": $durationMs,\n")
        out.append("${indent}\"initialVelocity\": ${number(initialVelocity)},\n")
        out.append("${indent}\"samples\": [\n")
        for (ms in 0..durationMs + 2) {
            val nanos = ms * 1_000_000L
            val value = anim.getValueFromNanos(nanos, initial, target, velocity(initialVelocity)).value
            out.append("$indent  [$ms, ${number(value)}]")
            out.append(if (ms == durationMs + 2) "\n" else ",\n")
        }
        out.append("$indent]")
    }

    @Test
    fun dumpSpringTraces() {
        val cases = springCases()
        val out = StringBuilder()
        out.append("{\n")
        out.append("  \"schema\": 1,\n")
        out.append("  \"source\": \"androidx.compose.material3:material3:1.5.0\",\n")
        out.append("  \"from\": 0.0,\n")
        out.append("  \"to\": 1.0,\n")
        out.append("  \"schemes\": {\n")
        val grouped = cases.groupBy { it.scheme }
        val schemes = grouped.entries.toList()
        for ((schemeIndex, entry) in schemes.withIndex()) {
            out.append("    \"${entry.key}\": {\n")
            for ((caseIndex, case) in entry.value.withIndex()) {
                val spring = case.spec as SpringSpec<Float>
                out.append("      \"${case.name}\": {\n")
                out.append("        \"stiffness\": ${number(spring.stiffness)},\n")
                out.append("        \"dampingRatio\": ${number(spring.dampingRatio)},\n")
                appendTrace(out, case.spec, 0f, "        ")
                out.append("\n")
                out.append("      }")
                out.append(if (caseIndex == entry.value.lastIndex) "\n" else ",\n")
            }
            out.append("    }")
            out.append(if (schemeIndex == schemes.lastIndex) "\n" else ",\n")
        }
        out.append("  },\n")
        // Interruption fidelity: a spring started while the value is still moving carries
        // velocity into the new target. Cover both directions on the two most dissimilar specs.
        out.append("  \"velocityScenarios\": [\n")
        val velocityCases = listOf(
            Triple("standard-default-spatial", cases[0].spec, 2.5f),
            Triple("standard-default-spatial-negative", cases[0].spec, -2.5f),
            Triple("expressive-fast-spatial", cases[7].spec, 2.5f),
            Triple("expressive-fast-spatial-negative", cases[7].spec, -2.5f),
        )
        for ((index, scenario) in velocityCases.withIndex()) {
            val spring = scenario.second as SpringSpec<Float>
            out.append("    {\n")
            out.append("      \"name\": \"${scenario.first}\",\n")
            out.append("      \"stiffness\": ${number(spring.stiffness)},\n")
            out.append("      \"dampingRatio\": ${number(spring.dampingRatio)},\n")
            appendTrace(out, scenario.second, scenario.third, "      ")
            out.append("\n")
            out.append("    }")
            out.append(if (index == velocityCases.lastIndex) "\n" else ",\n")
        }
        out.append("  ]\n")
        out.append("}\n")

        val output = File("build/spring-goldens.json")
        output.parentFile?.mkdirs()
        output.writeText(out.toString())
        println("Wrote ${output.absolutePath} (${cases.size} springs, ${velocityCases.size} velocity cases)")
    }
}
