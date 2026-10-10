// Presets de tema con variantes dark y light
export const themePresets = {
  default: {
    dark:{
      bg:"#0f1220", surface:"#1a1f35", border:"#2a2e46", text:"#e7e7ea", primary:"#6c5ce7",
      bubble_me:"#25306b", bubble_you:"#161a30", text_me:"#e7e7ea", text_you:"#e7e7ea",
      input_bg:"#0f1328", input_border:"#2a2e46", item_bg:"#171b2e", item_active_bg:"#1d2240",
      muted:"#2b2f4a", text_muted:"#a7aacc"
    },
    light:{
      bg:"#f4f6fb", surface:"#ffffff", border:"#e1e5ee", text:"#1c2234", primary:"#3b82f6",
      bubble_me:"#e8f0fe", bubble_you:"#f3f4f6", text_me:"#0f172a", text_you:"#0f172a",
      input_bg:"#ffffff", input_border:"#cfd6e6", item_bg:"#f3f4f6", item_active_bg:"#dbeafe",
      muted:"#e5e7eb", text_muted:"#6b7280"
    }
  },
  midnight: {
    dark: { bg:"#0b1022", surface:"#131a33", border:"#1d2449", text:"#e6e9f4", primary:"#7c69ff",
      bubble_me:"#29316d", bubble_you:"#101631", text_me:"#ffffff", text_you:"#e6e9f4",
      input_bg:"#0d1228", input_border:"#1d2449", item_bg:"#141a33", item_active_bg:"#1b2346",
      muted:"#2a315a", text_muted:"#9aa3c7" },
    light: { bg:"#eef2ff", surface:"#ffffff", border:"#d9def7", text:"#121634", primary:"#5b4ae6",
      bubble_me:"#e6eaff", bubble_you:"#f2f4ff", text_me:"#0c1130", text_you:"#0c1130",
      input_bg:"#ffffff", input_border:"#cfd6f6", item_bg:"#f2f4ff", item_active_bg:"#e6eaff",
      muted:"#e0e4fa", text_muted:"#5f68a5" }
  },
  forest: {
    dark: { bg:"#0f1a14", surface:"#17251d", border:"#24382c", text:"#e7f0e9", primary:"#2ecc71",
      bubble_me:"#1e3a2f", bubble_you:"#132219", text_me:"#e7f0e9", text_you:"#d7e8dc",
      input_bg:"#0f1d16", input_border:"#24382c", item_bg:"#16261e", item_active_bg:"#1c3429",
      muted:"#1e2f25", text_muted:"#9eb5a7" },
    light: { bg:"#f1f7f4", surface:"#ffffff", border:"#d9e7df", text:"#13261d", primary:"#2ab665",
      bubble_me:"#e9f7ef", bubble_you:"#f4f9f6", text_me:"#0f2018", text_you:"#0f2018",
      input_bg:"#ffffff", input_border:"#cfe2d9", item_bg:"#f4f9f6", item_active_bg:"#dff1e7",
      muted:"#e3eee8", text_muted:"#5a7a69" }
  },
  sunset: {
    dark: { bg:"#1a0f12", surface:"#261419", border:"#3a2027", text:"#ffe8e4", primary:"#ff7a59",
      bubble_me:"#3a1f24", bubble_you:"#201116", text_me:"#ffe8e4", text_you:"#ffd7cf",
      input_bg:"#1a1214", input_border:"#3a2027", item_bg:"#23161b", item_active_bg:"#2e1b21",
      muted:"#3a2027", text_muted:"#f3c1b9" },
    light: { bg:"#fff5f2", surface:"#ffffff", border:"#f0d6d0", text:"#3a2027", primary:"#e96341",
      bubble_me:"#fff0ea", bubble_you:"#fff7f4", text_me:"#351d23", text_you:"#351d23",
      input_bg:"#ffffff", input_border:"#e9c9c1", item_bg:"#fff7f4", item_active_bg:"#ffdcd2",
      muted:"#f7e0da", text_muted:"#8f5a4f" }
  },
  ocean: {
    dark: { bg:"#0f172a", surface:"#131c34", border:"#1f2a4a", text:"#e6f1ff", primary:"#38bdf8",
      bubble_me:"#183051", bubble_you:"#11213d", text_me:"#e6f1ff", text_you:"#d7e9ff",
      input_bg:"#0f182c", input_border:"#1f2a4a", item_bg:"#12203a", item_active_bg:"#183051",
      muted:"#1f2a4a", text_muted:"#9bb8d6" },
    light: { bg:"#f0f7ff", surface:"#ffffff", border:"#d6e6f7", text:"#0f172a", primary:"#0ea5e9",
      bubble_me:"#e7f3ff", bubble_you:"#f3f9ff", text_me:"#0f172a", text_you:"#0f172a",
      input_bg:"#ffffff", input_border:"#cfe0f2", item_bg:"#f3f9ff", item_active_bg:"#dbeeff",
      muted:"#e4effb", text_muted:"#5a748f" }
  },
  matrix: {
    dark: { bg:"#0b0f0b", surface:"#121814", border:"#1b241d", text:"#d7f8e5", primary:"#00ff7f",
      bubble_me:"#142a1f", bubble_you:"#0f1c15", text_me:"#d7f8e5", text_you:"#c8f2dc",
      input_bg:"#0e160f", input_border:"#1b241d", item_bg:"#131a15", item_active_bg:"#18221b",
      muted:"#1b241d", text_muted:"#9ed8b6" },
    light: { bg:"#f1fbf5", surface:"#ffffff", border:"#d5eadc", text:"#0f1c15", primary:"#00cc66",
      bubble_me:"#e8f7ee", bubble_you:"#f3fbf6", text_me:"#0f1c15", text_you:"#0f1c15",
      input_bg:"#ffffff", input_border:"#cfe6d6", item_bg:"#f3fbf6", item_active_bg:"#def7e7",
      muted:"#e0efe5", text_muted:"#567a68" }
  },
  whatsapp: {
    dark: { bg:"#0b141a", surface:"#111b21", border:"#1f2c33", text:"#e9edef", primary:"#00a884",
      bubble_me:"#005c4b", bubble_you:"#202c33", text_me:"#e9edef", text_you:"#e9edef",
      input_bg:"#111b21", input_border:"#1f2c33", item_bg:"#111b21", item_active_bg:"#202c33",
      muted:"#1f2c33", text_muted:"#8696a0" },
    light: { bg:"#efeae2", surface:"#ffffff", border:"#d1d7db", text:"#111b21", primary:"#008069",
      bubble_me:"#d9fdd3", bubble_you:"#f0f2f5", text_me:"#111b21", text_you:"#111b21",
      input_bg:"#ffffff", input_border:"#ccd3d7", item_bg:"#f0f2f5", item_active_bg:"#e2e6ea",
      muted:"#e2e6ea", text_muted:"#667781" }
  },
  telegram: {
    dark: { bg:"#0e1621", surface:"#17212b", border:"#25323b", text:"#e3e6ea", primary:"#2aabee",
      bubble_me:"#1e2c38", bubble_you:"#0f1a24", text_me:"#e3e6ea", text_you:"#d3d7dc",
      input_bg:"#0e1621", input_border:"#25323b", item_bg:"#17212b", item_active_bg:"#1e2c38",
      muted:"#25323b", text_muted:"#9aa7b2" },
    light: { bg:"#eaf0f7", surface:"#ffffff", border:"#d7e2ea", text:"#17212b", primary:"#2ca5e0",
      bubble_me:"#e8f3fb", bubble_you:"#f2f6fb", text_me:"#17212b", text_you:"#17212b",
      input_bg:"#ffffff", input_border:"#cfdee8", item_bg:"#f2f6fb", item_active_bg:"#e8f3fb",
      muted:"#e1eaf1", text_muted:"#5a6a78" }
  },
  msn: {
    dark: { bg:"#101010", surface:"#1a1a1a", border:"#2c2c2c", text:"#eaeaea", primary:"#00a2ed",
      bubble_me:"#222222", bubble_you:"#181818", text_me:"#eaeaea", text_you:"#dcdcdc",
      input_bg:"#141414", input_border:"#2c2c2c", item_bg:"#1a1a1a", item_active_bg:"#222222",
      muted:"#2c2c2c", text_muted:"#a0a0a0" },
    light: { bg:"#f7f7f7", surface:"#ffffff", border:"#dddddd", text:"#121212", primary:"#008bd6",
      bubble_me:"#eef6ff", bubble_you:"#f3f3f3", text_me:"#121212", text_you:"#121212",
      input_bg:"#ffffff", input_border:"#d6d6d6", item_bg:"#f3f3f3", item_active_bg:"#e6f3ff",
      muted:"#e9e9e9", text_muted:"#666666" }
  },
  feminine: {
    dark: { bg:"#1a1320", surface:"#23162b", border:"#3a2546", text:"#f8e7ff", primary:"#ff69b4",
      bubble_me:"#3a1f4a", bubble_you:"#1f1430", text_me:"#f8e7ff", text_you:"#f1dbff",
      input_bg:"#1a1426", input_border:"#3a2546", item_bg:"#23162b", item_active_bg:"#2e1b36",
      muted:"#3a2546", text_muted:"#e5c3f2" },
    light: { bg:"#fff0f7", surface:"#ffffff", border:"#f5d6e8", text:"#2b1636", primary:"#e255a3",
      bubble_me:"#ffe6f1", bubble_you:"#fff6fb", text_me:"#2b1636", text_you:"#2b1636",
      input_bg:"#ffffff", input_border:"#efd0e3", item_bg:"#fff6fb", item_active_bg:"#ffe6f1",
      muted:"#f5ddea", text_muted:"#7a557f" }
  },
  starwars: {
    dark: { bg:"#0b0b0b", surface:"#121212", border:"#232323", text:"#f3f3f3", primary:"#ffd700",
      bubble_me:"#1f1f1f", bubble_you:"#111111", text_me:"#f3f3f3", text_you:"#e5e5e5",
      input_bg:"#121212", input_border:"#232323", item_bg:"#121212", item_active_bg:"#1f1f1f",
      muted:"#232323", text_muted:"#bdbdbd" },
    light: { bg:"#fffbea", surface:"#ffffff", border:"#efe3bf", text:"#111111", primary:"#d4af37",
      bubble_me:"#fff4d1", bubble_you:"#fffaf0", text_me:"#111111", text_you:"#111111",
      input_bg:"#ffffff", input_border:"#ebdfb6", item_bg:"#fffaf0", item_active_bg:"#fff4d1",
      muted:"#f1e6c4", text_muted:"#6b5a2e" }
  },
  spiderman: {
    dark: { bg:"#0f0f1a", surface:"#17172b", border:"#2a2a46", text:"#e8e8f4", primary:"#e11d48",
      bubble_me:"#2b2b4a", bubble_you:"#141428", text_me:"#ffffff", text_you:"#e8e8f4",
      input_bg:"#121226", input_border:"#2a2a46", item_bg:"#17172b", item_active_bg:"#22224a",
      muted:"#2a2a46", text_muted:"#a9a9cf" },
    light: { bg:"#f8f8ff", surface:"#ffffff", border:"#e1e1f2", text:"#15152b", primary:"#c81e45",
      bubble_me:"#ffe6ea", bubble_you:"#f2f2ff", text_me:"#15152b", text_you:"#15152b",
      input_bg:"#ffffff", input_border:"#dadaf0", item_bg:"#f2f2ff", item_active_bg:"#ffe6ea",
      muted:"#e9e9f7", text_muted:"#5a5a7a" }
  },
  ironman: {
    dark: { bg:"#140e0e", surface:"#1e1414", border:"#3a2020", text:"#f9e6e6", primary:"#d10000",
      bubble_me:"#3a1c1c", bubble_you:"#201212", text_me:"#f9e6e6", text_you:"#efdddd",
      input_bg:"#171010", input_border:"#3a2020", item_bg:"#1e1414", item_active_bg:"#2a1a1a",
      muted:"#3a2020", text_muted:"#e8c3c3" },
    light: { bg:"#fff3f3", surface:"#ffffff", border:"#f0d1d1", text:"#201212", primary:"#b80000",
      bubble_me:"#ffe3e3", bubble_you:"#fff7f7", text_me:"#201212", text_you:"#201212",
      input_bg:"#ffffff", input_border:"#e8c3c3", item_bg:"#fff7f7", item_active_bg:"#ffe3e3",
      muted:"#f2d9d9", text_muted:"#7a4f4f" }
  }
};