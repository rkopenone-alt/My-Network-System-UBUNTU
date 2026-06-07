import os
files = [
    r'rescuer-app/node_modules/@react-native/gradle-plugin/build.gradle.kts',
    r'rescuer-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin/build.gradle.kts'
]
for f in files:
    if os.path.exists(f):
        c = open(f).read()
        c = c.replace('id("org.jetbrains.kotlin.jvm") version "1.9.24"', 'alias(libs.plugins.kotlin.jvm)')
        c = c.replace('implementation("com.google.code.gson:gson:2.10.1")', 'implementation(libs.gson)')
        c = c.replace('implementation("com.google.guava:guava:33.0.0-jre")', 'implementation(libs.guava)')
        c = c.replace('implementation("com.squareup:javapoet:1.13.0")', 'implementation(libs.javapoet)')
        c = c.replace('implementation("com.android.tools.build:gradle:8.2.1")', 'implementation(libs.agp)')
        c = c.replace('compileOnly("com.android.tools.build:gradle:8.2.1")', 'compileOnly(libs.agp)')
        c = c.replace('testImplementation("junit:junit:4.13.2")', 'testImplementation(libs.junit)')
        c = c.replace('testImplementation("org.assertj:assertj-core:3.24.2")', 'testImplementation(libs.assertj)')
        open(f, 'w').write(c)
