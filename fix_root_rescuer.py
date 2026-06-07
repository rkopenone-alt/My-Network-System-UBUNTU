p = r'rescuer-app/node_modules/@react-native/gradle-plugin/build.gradle.kts'
with open(p, 'r') as f:
    c = f.read()
c = c.replace('id("org.jetbrains.kotlin.jvm") apply false', 'id("org.jetbrains.kotlin.jvm") version "2.1.20" apply false')
c = c.replace('id("org.jetbrains.kotlin.jvm") version "1.9.24" apply false', 'id("org.jetbrains.kotlin.jvm") version "2.1.20" apply false')
with open(p, 'w') as f:
    f.write(c)
