package com.nasyxrakeeb.m3ereference

import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.MaterialShapes
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
    private val names =
        listOf(
            "Arch",
            "Arrow",
            "Boom",
            "Bun",
            "Burst",
            "Circle",
            "ClamShell",
            "Clover4Leaf",
            "Clover8Leaf",
            "Cookie12Sided",
            "Cookie4Sided",
            "Cookie6Sided",
            "Cookie7Sided",
            "Cookie9Sided",
            "Diamond",
            "Fan",
            "Flower",
            "Gem",
            "Ghostish",
            "Heart",
            "Oval",
            "Pentagon",
            "Pill",
            "PixelCircle",
            "PixelTriangle",
            "Puffy",
            "PuffyDiamond",
            "SemiCircle",
            "Slanted",
            "SoftBoom",
            "SoftBurst",
            "Square",
            "Sunny",
            "Triangle",
            "VerySunny",
        )

    private fun shape(name: String): RoundedPolygon =
        when (name) {
            "Arch" -> MaterialShapes.Arch
            "Arrow" -> MaterialShapes.Arrow
            "Boom" -> MaterialShapes.Boom
            "Bun" -> MaterialShapes.Bun
            "Burst" -> MaterialShapes.Burst
            "Circle" -> MaterialShapes.Circle
            "ClamShell" -> MaterialShapes.ClamShell
            "Clover4Leaf" -> MaterialShapes.Clover4Leaf
            "Clover8Leaf" -> MaterialShapes.Clover8Leaf
            "Cookie12Sided" -> MaterialShapes.Cookie12Sided
            "Cookie4Sided" -> MaterialShapes.Cookie4Sided
            "Cookie6Sided" -> MaterialShapes.Cookie6Sided
            "Cookie7Sided" -> MaterialShapes.Cookie7Sided
            "Cookie9Sided" -> MaterialShapes.Cookie9Sided
            "Diamond" -> MaterialShapes.Diamond
            "Fan" -> MaterialShapes.Fan
            "Flower" -> MaterialShapes.Flower
            "Gem" -> MaterialShapes.Gem
            "Ghostish" -> MaterialShapes.Ghostish
            "Heart" -> MaterialShapes.Heart
            "Oval" -> MaterialShapes.Oval
            "Pentagon" -> MaterialShapes.Pentagon
            "Pill" -> MaterialShapes.Pill
            "PixelCircle" -> MaterialShapes.PixelCircle
            "PixelTriangle" -> MaterialShapes.PixelTriangle
            "Puffy" -> MaterialShapes.Puffy
            "PuffyDiamond" -> MaterialShapes.PuffyDiamond
            "SemiCircle" -> MaterialShapes.SemiCircle
            "Slanted" -> MaterialShapes.Slanted
            "SoftBoom" -> MaterialShapes.SoftBoom
            "SoftBurst" -> MaterialShapes.SoftBurst
            "Square" -> MaterialShapes.Square
            "Sunny" -> MaterialShapes.Sunny
            "Triangle" -> MaterialShapes.Triangle
            "VerySunny" -> MaterialShapes.VerySunny
            else -> error("Unknown shape $name")
        }

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
        val progressValues = listOf(0f, 0.25f, 0.5f, 0.75f, 1f)
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
