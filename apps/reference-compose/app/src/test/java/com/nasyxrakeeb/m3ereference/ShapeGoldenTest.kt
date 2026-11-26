package com.nasyxrakeeb.m3ereference

import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.graphics.shapes.Cubic
import androidx.graphics.shapes.Morph
import androidx.graphics.shapes.RoundedPolygon
import org.junit.Test
import java.io.File

/**
 * Dumps the Compose/AndroidX shape and morph geometry used by the Day 6 golden test.
 *
 * This is a JVM unit test so the golden can be regenerated without an emulator. The output is
 * copied to docs/specs/shapes/goldens.json by tools/shapes/generate-goldens.sh.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
class ShapeGoldenTest {
    private val names = MATERIAL_SHAPE_NAMES

    private fun shape(name: String): RoundedPolygon = materialShape(name)

    private fun number(value: Float): String = value.toString()

    private fun cubicJson(cubic: Cubic, indent: String): String =
        "$indent[${number(cubic.anchor0X)}, ${number(cubic.anchor0Y)}, " +
            "${number(cubic.control0X)}, ${number(cubic.control0Y)}, " +
            "${number(cubic.control1X)}, ${number(cubic.control1Y)}, " +
            "${number(cubic.anchor1X)}, ${number(cubic.anchor1Y)}]"

    private fun cubicsJson(cubics: List<Cubic>, indent: String): String =
        cubics.joinToString(",\n", prefix = "[\n", postfix = "\n$indent]") {
            cubicJson(it, "$indent  ")
        }

    @Test
    fun dumpShapesAndMorphs() {
        val pairs = mutableListOf<Pair<String, String>>()
        for (index in names.indices) {
            pairs.add(names[index] to names[(index + 1) % names.size])
        }
        for (index in 0 until 15) {
            pairs.add(names[index] to names[(index + 7) % names.size])
        }

        val out = StringBuilder()
        out.append("{\n")
        out.append("  \"schema\": 1,\n")
        out.append(
            "  \"source\": \"androidx.graphics:graphics-shapes:1.1.0 + androidx.compose.material3:material3:1.5.0\",\n",
        )
        out.append("  \"shapeNames\": ${names.joinToString(", ", "[", "]") { "\"$it\"" }},\n")
        out.append("  \"shapes\": {\n")
        for ((index, name) in names.withIndex()) {
            val polygon = shape(name)
            out.append("    \"$name\": {\n")
            out.append(
                "      \"center\": [${number(polygon.centerX)}, ${number(polygon.centerY)}],\n",
            )
            out.append("      \"features\": [\n")
            for ((featureIndex, feature) in polygon.features.withIndex()) {
                val type = if (feature.isEdge) "edge" else "corner"
                val convex = feature.isConvexCorner
                out.append(
                    "        {\"type\": \"$type\", \"convex\": $convex, \"cubics\": ${feature.cubics.size}}",
                )
                out.append(if (featureIndex == polygon.features.lastIndex) "\n" else ",\n")
            }
            out.append("      ],\n")
            out.append("      \"cubics\": ${cubicsJson(polygon.cubics, "      ")}\n")
            out.append("    }")
            out.append(if (index == names.lastIndex) "\n" else ",\n")
        }
        out.append("  },\n")
        out.append("  \"morphs\": [\n")
        // Nine in-range samples including intermediate values, plus two close
        // out-of-range samples for the spring-overshoot case documented by
        // Morph.asCubics. -0.1 / 1.1 bracket the first overshoot of the
        // damping-ratio-0.6 spring used by LoadingIndicator.
        val progressValues =
            listOf(-0.1f, 0f, 0.1f, 0.25f, 0.33f, 0.5f, 0.6f, 0.75f, 0.9f, 1f, 1.1f)
        for ((index, pair) in pairs.withIndex()) {
            val morph = Morph(shape(pair.first), shape(pair.second))
            out.append("    {\n")
            out.append("      \"from\": \"${pair.first}\",\n")
            out.append("      \"to\": \"${pair.second}\",\n")
            out.append("      \"samples\": [\n")
            for ((sampleIndex, progress) in progressValues.withIndex()) {
                out.append("        {\n")
                out.append("          \"progress\": ${number(progress)},\n")
                out.append(
                    "          \"cubics\": ${cubicsJson(morph.asCubics(progress), "          ")}\n",
                )
                out.append("        }")
                out.append(if (sampleIndex == progressValues.lastIndex) "\n" else ",\n")
            }
            out.append("      ]\n")
            out.append("    }")
            out.append(if (index == pairs.lastIndex) "\n" else ",\n")
        }
        out.append("  ]\n")
        out.append("}\n")

        val output = File("build/shapes-goldens.json")
        output.parentFile?.mkdirs()
        output.writeText(out.toString())
        println("Wrote ${output.absolutePath} (${names.size} shapes, ${pairs.size} morphs)")
    }
}
