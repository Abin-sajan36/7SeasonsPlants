const STORAGE_KEY = '7seasonsplants_app_data_v1';
const saved = `[{"id":"usr-123","name":"Test","email":"test@test.com"}]`;
try {
  const parsed = JSON.parse(saved);
  if (Array.isArray(parsed) && parsed.length > 0) console.log("Success:", parsed);
} catch (e) {
  console.error(e);
}
