
const db = require('./backend/config/db.config');

async function checkTeamMembers() {
  try {
    const [teams] = await db.execute('SELECT id, name FROM teams WHERE name = ?', ['FRONTEND DEVELOPER']);
    console.log('--- Teams found ---');
    console.log(teams);
    
    if (teams.length > 0) {
      const teamId = teams[0].id;
      const [members] = await db.execute(`
        SELECT u.id, u.name, u.role 
        FROM team_members tm 
        JOIN users u ON tm.user_id = u.id 
        WHERE tm.team_id = ?`, [teamId]);
      console.log(`--- Members in team #${teamId} ---`);
      console.log(members);
    }

    const [allMembers] = await db.execute('SELECT id, name, role FROM users WHERE role = ?', ['team_member']);
    console.log('--- All Team Members in DB ---');
    console.log(allMembers);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkTeamMembers();
