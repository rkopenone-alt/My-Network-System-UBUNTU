import os
import re

dir_path = r'rescuer-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin'

replacements = {
    r'alias\(libs\.plugins\.kotlin\.jvm\)': 'id("org.jetbrains.kotlin.jvm") version "1.9.24"',
    r'implementation\(libs\.gson\)': 'implementation("com.google.code.gson:gson:2.10.1")',
    r'implementation\(libs\.guava\)': 'implementation("com.google.guava:guava:33.0.0-jre")',
    r'implementation\(libs\.javapoet\)': 'implementation("com.squareup:javapoet:1.13.0")',
    r'implementation\(libs\.agp\)': 'implementation("com.android.tools.build:gradle:8.2.1")',
    r'compileOnly\(libs\.agp\)': 'compileOnly("com.android.tools.build:gradle:8.2.1")',
    r'testImplementation\(libs\.junit\)': 'testImplementation("junit:junit:4.13.2")',
    r'testImplementation\(libs\.assertj\)': 'testImplementation("org.assertj:assertj-core:3.24.2")',
}

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.kts'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            original_content = content
            for pattern, replacement in replacements.items():
                content = re.sub(pattern, replacement, content)
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Patched {file_path}")
