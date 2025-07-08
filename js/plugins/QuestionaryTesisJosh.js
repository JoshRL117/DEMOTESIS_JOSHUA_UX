/*:
 * @plugindesc Manda las respuestas del cuestionarios a un servidor.
 * @author Joshua
 *
 * @param VariableID
 * @text ID de la Variable
 * @type variable
 * @desc ID de la variable
 * @default 10
 */

(function() {
    const parameters = PluginManager.parameters('EnviarRespuestas');
    const variableID = Number(parameters['VariableID'] || 10);
    // Añadir la función al evento de tu NPC
    Game_Interpreter.prototype.command_355 = function() {
      var respuestas = $gameVariables.value(variableID);  
      console.log("Respuestas a enviar:", respuestas);  
      fetch("http://localhost:8000/encuestas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "texto": "Hola mundo" })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Datos enviados correctamente:", data);  
        if (data.status === "success") {
          alert("Respuestas enviadas exitosamente.");
        }
      })
      .catch(error => {
        console.error("Error al enviar los datos:", error);  
      });
      return true;
    };
  
  })();