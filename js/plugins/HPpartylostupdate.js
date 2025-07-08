/*:
 * @plugindesc Registra toda la vida que pierde la party del jugador y la guarda en una variable.
 * @author Joshua
 *
 * @param VariableID
 * @text ID de la Variable
 * @type variable
 * @desc ID de la variable donde se almacenará el daño total recibido.
 * @default 11
 */

(function() {
    // 1. Obtener los parámetros definidos arriba
    const parameters = PluginManager.parameters('HPpartylostupdate');
    const variableId = Number(parameters['VariableID'] || 11);

    // 2. Guardar el método original de gainHp
    const _Game_Actor_gainHp = Game_Actor.prototype.gainHp;

    // 3. Redefinir gainHp
    Game_Actor.prototype.gainHp = function(value) {
        // Si el valor es negativo, se ha perdido vida
        if (value < 0) {
            const lost = Math.abs(value); // Convertirlo a positivo
            const current = $gameVariables.value(variableId); // Leer valor actual
            $gameVariables.setValue(variableId, current + lost); // Sumar daño
        }

        // Llamar al método original para que el juego siga funcionando bien
        _Game_Actor_gainHp.call(this, value);
    };
})();
