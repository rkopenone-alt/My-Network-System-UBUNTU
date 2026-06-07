import os

dirs = [
    r'rescuer-app/node_modules/@react-native/gradle-plugin',
    r'rescuer-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin',
    r'public-sos-app/node_modules/@react-native/gradle-plugin',
    r'public-sos-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin'
]

for d in dirs:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.kts'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                content = content.replace('id("org.jetbrains.kotlin.jvm") version "1.9.24".apply(false)', 'id("org.jetbrains.kotlin.jvm") version "1.9.24" apply false')
                content = content.replace('id("org.jetbrains.kotlin.jvm") version "2.1.20".apply(false)', 'id("org.jetbrains.kotlin.jvm") version "2.1.20" apply false')
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed syntax in {file_path}")

print("Syntax fixed!")
