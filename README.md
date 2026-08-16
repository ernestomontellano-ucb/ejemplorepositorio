# Taller de Diseño Digital 1

Repositorio de trabajo colaborativo para la materia **Taller de Diseño Digital 1**.

Este proyecto será construido progresivamente durante el semestre. Su objetivo es aplicar conceptos de **HTML, CSS, JavaScript, Git y GitHub** mientras desarrollamos una experiencia web de manera colaborativa.

Cada estudiante contará con un espacio personal dentro del proyecto y contribuirá mediante el flujo:

**Fork → Clone → Branch → Modificar → Commit → Push → Pull Request → Merge**

---

## Estructura del proyecto

```text
ejemplorepositorio/
│
├── index.html
│
├── pages/
│   ├── estudiantes/
│   │   ├── nombre-apellido/
│   │   │   └── index.html
│   │   └── ...
│   ├── proyecto/
│   │   └── index.html
│   └── recursos/
│       └── index.html
│
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   ├── img/
│   │   ├── estudiantes/
│   │   ├── proyecto/
│   │   └── ui/
│   └── fonts/
│
├── data/
│   └── estudiantes.json
│
├── CONTRIBUTING.md
└── README.md
```

## ¿Qué contiene cada carpeta?

### `index.html`

Es la página principal del proyecto.

Desde aquí se podrá acceder a las diferentes secciones del sitio y a las páginas personales de los estudiantes.

### `pages/`

Contiene las páginas secundarias del sitio:

```text
pages/
├── estudiantes/
├── proyecto/
└── recursos/
```

### `pages/estudiantes/`

Cada estudiante tiene una carpeta identificada mediante su primer nombre y primer apellido:

```text
pages/estudiantes/
├── gael-aguilar/
├── nicole-alvarez/
├── alejandra-arguedas/
└── ...
```

Dentro de cada carpeta debe existir un archivo `index.html`.

Por ejemplo:

```text
pages/estudiantes/gael-aguilar/index.html
```

### `assets/`

Contiene los recursos compartidos por el sitio:

```text
assets/
├── css/
├── js/
├── img/
└── fonts/
```

Estos recursos se irán incorporando progresivamente durante el semestre.

### `data/`

Contiene información estructurada que posteriormente podrá ser utilizada desde JavaScript.

---

# Primera contribución

La primera actividad consiste en crear o modificar tu **página personal** y proponer su incorporación al repositorio general.

## 1. Haz un Fork

En GitHub, realiza un **Fork** de:

`ernestomontellano-ucb/ejemplorepositorio`

El fork creará una copia del proyecto dentro de tu propia cuenta de GitHub.

```text
ernestomontellano-ucb/ejemplorepositorio
                    │
                    │ FORK
                    ↓
tu-usuario/ejemplorepositorio
```

---

## 2. Clona tu Fork

Debes clonar **tu propia copia**, no nuevamente el repositorio del docente.

```bash
git clone git@github.com:TU-USUARIO/ejemplorepositorio.git
```

Después:

```bash
cd ejemplorepositorio
```

---

## 3. Comprueba el repositorio

Antes de comenzar:

```bash
git status
```

Comprueba también el repositorio remoto:

```bash
git remote -v
```

El remoto `origin` debería apuntar a **tu fork**.

---

## 4. Crea una rama

No trabajes directamente sobre `main`.

Crea una rama utilizando el formato:

```text
pagina-nombre-apellido
```

Por ejemplo:

```bash
git switch -c pagina-gael-aguilar
```

Comprueba la rama activa:

```bash
git branch
```

El símbolo `*` indica la rama en la que estás trabajando.

---

# Tu página personal

Trabaja únicamente dentro de tu carpeta:

```text
pages/estudiantes/nombre-apellido/
```

Por ejemplo:

```text
pages/estudiantes/gael-aguilar/
```

Tu página principal debe llamarse `index.html`.

```text
pages/
└── estudiantes/
    └── gael-aguilar/
        └── index.html
```

---

## Contenido mínimo

La página debe utilizar una estructura HTML5 correcta:

```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nombre del estudiante</title>
</head>

<body>

    <header>
        <h1>Nombre del estudiante</h1>
        <p>Taller de Diseño Digital 1</p>
    </header>

    <main>

        <section>
            <h2>Sobre mí</h2>
            <p>Breve presentación personal.</p>
        </section>

        <section>
            <h2>Mis intereses</h2>

            <ul>
                <li>Interés 1</li>
                <li>Interés 2</li>
                <li>Interés 3</li>
            </ul>
        </section>

        <section>
            <h2>Qué quiero explorar</h2>

            <p>
                Describe algo que te interese aprender,
                investigar o desarrollar durante el semestre.
            </p>
        </section>

    </main>

    <footer>
        <p>Taller de Diseño Digital 1 — 2026</p>
    </footer>

</body>

</html>
```

Puedes ampliar esta estructura utilizando otros elementos HTML vistos en clase.

---

# Registrar tus cambios

## 1. Comprueba qué modificaste

```bash
git status
```

Git mostrará los archivos nuevos o modificados.

## 2. Prepara tu archivo

Por ejemplo:

```bash
git add pages/estudiantes/gael-aguilar/index.html
```

Comprueba nuevamente:

```bash
git status
```

## 3. Realiza un Commit

Registra tus cambios:

```bash
git commit -m "Crea página personal de Gael Aguilar"
```

Utiliza un mensaje que describa claramente qué hiciste.

Evita mensajes como:

```text
cambios
cosas
prueba
commit
final
```

Prefiere mensajes descriptivos:

```text
Crea página personal de Gael Aguilar
Añade sección de intereses personales
Corrige estructura semántica de página personal
```

---

# Publicar tu trabajo

Envía tu rama a tu repositorio de GitHub:

```bash
git push -u origin pagina-gael-aguilar
```

La opción `-u` establece la relación entre nuestra rama local y la rama remota.

Los siguientes `push` podrán realizarse simplemente con:

```bash
git push
```

---

# Crear un Pull Request

Después del `push`, entra a tu repositorio en GitHub.

GitHub normalmente mostrará la posibilidad de crear un:

**Compare & pull request**

El Pull Request debe proponer incorporar tu rama al repositorio:

```text
ernestomontellano-ucb/ejemplorepositorio
```

en la rama:

```text
main
```

El flujo completo será:

```text
REPOSITORIO DEL DOCENTE
        │
       FORK
        ↓
TU REPOSITORIO
        │
       CLONE
        ↓
TU COMPUTADORA
        │
      BRANCH
        ↓
     MODIFICAR
        ↓
       ADD
        ↓
      COMMIT
        ↓
       PUSH
        ↓
  PULL REQUEST
        ↓
  REVISIÓN DOCENTE
        ↓
       MERGE
        ↓
REPOSITORIO DEL DOCENTE
```

---

# Reglas de colaboración

Cada estudiante debe modificar **únicamente su propio espacio**:

```text
pages/estudiantes/nombre-apellido/
```

No modifiques:

- carpetas de otros estudiantes;
- páginas personales de otros estudiantes;
- archivos globales del proyecto;
- `index.html` principal;
- archivos de configuración;

salvo que la actividad de clase indique explícitamente lo contrario.

Esto permite que múltiples personas trabajen simultáneamente reduciendo conflictos entre contribuciones.

---

# Antes de realizar el Pull Request

Comprueba el estado:

```bash
git status
```

Revisa tus commits:

```bash
git log --oneline
```

Comprueba tu rama:

```bash
git branch
```

Verifica el repositorio remoto:

```bash
git remote -v
```

---

# Flujo que debes recordar

```text
FORK
  ↓
CLONE
  ↓
BRANCH
  ↓
MODIFICAR
  ↓
STATUS
  ↓
ADD
  ↓
COMMIT
  ↓
PUSH
  ↓
PULL REQUEST
  ↓
REVISIÓN
  ↓
MERGE
```

Git no consiste solamente en memorizar comandos.

> **¿Dónde están mis cambios ahora y hacia dónde necesito llevarlos?**

---

## Taller de Diseño Digital 1

**Universidad Católica Boliviana San Pablo**  
Departamento de Diseño  
Semestre 2-2026