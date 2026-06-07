import os
dirs = [
    r'rescuer-app/node_modules/@react-native/gradle-plugin',
    r'rescuer-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin',
    r'public-sos-app/node_modules/@react-native/gradle-plugin',
    r'public-sos-app/node_modules/expo-modules-autolinking/android/expo-gradle-plugin'
]
for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.kts'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                content = content.replace('id("org.jetbrains.kotlin.jvm") apply false', 'id("org.jetbrains.kotlin.jvm") version "1.9.24" apply false')
                content = content.replace('id("org.jetbrains.kotlin.jvm")\n', 'id("org.jetbrains.kotlin.jvm") version "1.9.24"\n')
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
print('Fixed!')
