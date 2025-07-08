/*:
 * @plugindesc Cuenta cuántas veces un miembro de la party llega a 0 HP y lo guarda en una variable.
 * @author Joshua
 *
 * @param VariableID
 * @text ID de la Variable
 * @type variable
 * @desc ID de la variable donde se almacenarán las muertes de miembros de la party.
 * @default 12
 */
(function(){
    const parameters = PluginManager.parameters('NumOfDeath');
    const variableId = Number(parameters['VariableID'] || 12);
    const _Game_Actor_performCollapse = Game_Actor.prototype.performCollapse;
    Game_Actor.prototype.performCollapse = function() {
        if (this.isActor()) {
            const current = $gameVariables.value(variableId);
            $gameVariables.setValue(variableId, current + 1);
        }
        _Game_Actor_performCollapse.call(this);
    };
})();
