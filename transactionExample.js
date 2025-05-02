// transactionExample.js
const pool = require('./db');

async function doTransaction() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const studentId = 'S10810001';
    const newDeptId = 'EE001';

    // 1️⃣ 檢查學生是否存在
    const checkStudent = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
    const checkResult = await conn.query(checkStudent, [studentId]);

    if (checkResult.length === 0) {
      console.log(`查無此學號：${studentId}`);
      return;
    }

    // 2️⃣ 修改學生的系別
    const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
    await conn.query(updateStudent, [newDeptId, studentId]);

    // 3️⃣ 查詢修改後的系別資訊
    const queryDept = `
      SELECT s.Student_ID, s.Name, d.Department_ID, d.Name AS DepartmentName
      FROM STUDENT s
      JOIN DEPARTMENT d ON s.Department_ID = d.Department_ID
      WHERE s.Student_ID = ?
    `;
    const result = await conn.query(queryDept, [studentId]);

    await conn.commit();
    console.log('✅ 修改成功，學生目前系所資訊如下：');
    console.table(result);
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ 交易失敗，已回滾：', err);
  } finally {
    if (conn) conn.release();
  }
}

doTransaction();
