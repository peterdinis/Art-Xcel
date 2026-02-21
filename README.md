# Art-Xcel 📊

A premium, feature-rich spreadsheet application built with Next.js, TanStack Table, and ExcelJS. Art-Xcel combines the power of traditional spreadsheet software with a modern, high-performance web interface.

## 🚀 Key Features

### 🧩 Advanced Editor
- **Dynamic Grid Interface**: High-performance grid with virtualized rows and columns.
- **Rich Cell Formatting**: Support for bold, italic, underline, custom text colors, and cell backgrounds.
- **Floating Elements**: Seamlessly insert and manipulate **Shapes** (Rectangle, Circle, Line), **Icons** (Lucide Library), and **Charts** (Bar, Line, Pie).
- **Data Utilities**: Built-in tools for "Remove Duplicates" and "Text to Columns" operations.

### 🧪 Robust Formula Engine
- **Categorized Libraries**: Effortlessly discover advanced functions through Financial, Logical, Text, and Statistical groupings in the Ribbon.
- **Smart AutoSum**: Intelligent range detection for instant calculations.
- **Template Injection**: Instant formula guidance with template insertion for complex functions like `PMT`, `VLOOKUP`, and `SUMIF`.

### 📂 File Management & Integration
- **Excel Upload**: Premium drag-and-drop zone powered by **FilePond** for `.xlsx` files.
- **Server-Side Parsing**: Robust binary file processing using **Next.js Server Actions** and `ExcelJS` for reliable data extraction.
- **Cloud Sync**: Professional persistence patterns using `next/cache` and `revalidatePath` for sychronized data state.

### ⚡ Power User UX
- **Shortcut Discovery**: Quick-access shortcut reference via a dedicated dialog (Ctrl+/) and cell context menus.
- **Smooth Animations**: Fluid UI transitions and immediate state updates using **Framer Motion**.
- **Responsive Design**: Elegant glassmorphism aesthetics that feel premium and state-of-the-art.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS + TailwindCSS (for Layout) + Lucide Icons
- **State Management**: React Hooks + LocalStorage Persistence
- **Spreadsheet Logic**: TanStack Table + ExcelJS
- **Animations**: Framer Motion
- **UI Components**: Radix UI + Shadcn UI
- **File Upload**: FilePond

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/peterdinis/Art-Xcel.git
cd excel-editor
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard and start editing!

## 📄 License
MIT
