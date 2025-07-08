/*:
 * @plugindesc Guarda el número de turno actual de batalla en una variable del juego. Se actualiza al inicio de cada turno.
 * @author Joshua
 * @help Este plugin guarda el turno actual en la variable que configures.
 *
 * @param TurnVariableID
 * @text ID de la Variable del Turno
 * @type variable
 * @desc ID de la variable donde se almacenará el número de turno actual.
 * @default 14
 */


(function() {
    const parameters = PluginManager.parameters('TurnCounter');
    const turnVariableId = Number(parameters['TurnVariableID'] || 14);

    const _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        _BattleManager_startTurn.call(this);
        if (typeof this._turnCount === "undefined" || this._turnCount === null) {
            this._turnCount = 1;
        } else {
            this._turnCount += 1;
        }
        //const turnoActual = this._turnCount;
        console.log("Turno actual:", this._turnCount);
        $gameVariables.setValue(turnVariableId, this._turnCount);
    };
})();