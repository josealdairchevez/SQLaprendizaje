let db; // Variable global para la base de datos

// Iniciar SQLite y cargar datos ficticios de WideWorldImporters
initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` }).then(function(SQL){
    db = new SQL.Database();
    
    // Crear esquema y poblar con datos
    let sqlstr = `
        CREATE TABLE Warehouse_StockItems (
            StockItemID int,
            StockItemName varchar(255),
            UnitPrice decimal
        );
        INSERT INTO Warehouse_StockItems VALUES (1, 'USB Drive 8GB', 15.00);
        INSERT INTO Warehouse_StockItems VALUES (2, 'Teclado Mecánico', 85.50);
        INSERT INTO Warehouse_StockItems VALUES (3, 'Monitor 24 pulgadas', 150.00);
        INSERT INTO Warehouse_StockItems VALUES (4, 'Ratón Inalámbrico', 55.00);
        INSERT INTO Warehouse_StockItems VALUES (5, 'Silla Ergonómica', 120.00);
    `;
    db.run(sqlstr);
    console.log("Motor SQL activado y base de datos lista.");
});

// Función vinculada al botón de ejecutar
document.getElementById('executeBtn').addEventListener('click', function() {
    // Obtenemos el código desde nuestro editor CodeMirror
    const query = window.editor.getValue();
    const errorDiv = document.getElementById("error-msg");
    const successDiv = document.getElementById("success-msg");
    const resDiv = document.getElementById("resultado");
    
    // Limpiamos mensajes anteriores
    errorDiv.innerHTML = "";
    errorDiv.classList.remove("show");
    successDiv.innerHTML = "";
    successDiv.classList.remove("show");
    resDiv.innerHTML = "";

    try {
        const res = db.exec(query);
        if (res.length > 0) {
            resDiv.innerHTML = generarTablaHTML(res[0].columns, res[0].values);
            // Llamamos a la función de gamificación (la crearemos luego)
            if (typeof evaluarRespuesta === "function") evaluarRespuesta(query, res[0].values);
        } else {
            resDiv.innerHTML = "<p style='color: var(--accent-cyan); font-weight: bold; margin-top: 10px;'>✔️ Consulta ejecutada: 0 registros encontrados.</p>";
        }
    } catch (err) {
        errorDiv.innerHTML = "❌ Error de sintaxis: " + err.message;
        errorDiv.classList.add("show");
    }
});

// Función para pintar la tabla de resultados con el estilo oscuro
function generarTablaHTML(columnas, valores) {
    let html = "<table style='width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden;'><thead><tr>";
    columnas.forEach(col => html += `<th style='border-bottom: 2px solid var(--accent-cyan); padding: 12px; color: var(--accent-cyan); text-transform: uppercase; font-size: 0.85rem; text-align: left;'>${col}</th>`);
    html += "</tr></thead><tbody>";
    valores.forEach(fila => {
        html += "<tr>";
        fila.forEach(val => html += `<td style='padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1;'>${val}</td>`);
        html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
}
