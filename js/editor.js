// Inicialización del editor CodeMirror cuando la página carga
window.onload = function() {
    window.editor = CodeMirror.fromTextArea(document.getElementById("sql-editor"), {
        mode: "text/x-sql",
        theme: "dracula",
        lineNumbers: true,
        lineWrapping: true,
        viewportMargin: Infinity
    });
    // Ajustamos el tamaño del editor
    window.editor.setSize("100%", "200px");
};
