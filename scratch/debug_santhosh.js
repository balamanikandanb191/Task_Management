
const db = require('./backend/config/db.config');

async function debugMember() {
  try {
    const [users] = await db.execute('SELECT id, name, role FROM users WHERE name LIKE ?', ['%santhosh%']);
    console.log('--- Users matching santhosh ---');
    console.log(users);

    if (users.length > 0) {
      const userId = users[0].id;
      const [memberships] = await db.execute(`
        SELECT tm.*, t.name as team_name, p.title as project_title 
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        JOIN projects p ON t.project_id = p.id
        WHERE tm.user_id = ?`, [userId]);
      console.log(`--- Memberships for ${users[0].name} (#${userId}) ---`);
      console.log(memberships);
    }

    const [allTeams] = await db.execute('SELECT id, name FROM teams');
    console.log('--- All Teams in DB ---');
    console.log(allTeams);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debugMember();
