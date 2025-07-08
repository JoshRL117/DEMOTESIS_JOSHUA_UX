/*:
 * @plugindesc Cuenta cuántas veces un miembro de la party recibe un golpe (físico o mágico) y lo guarda en una variable.
 * @author Joshua
 *
 * @param VariableID
 * @text ID de la Variable
 * @type variable
 * @desc ID de la variable donde se almacenará el número total de golpes recibidos.
 * @default 13
 */

(function() {
    const parameters = PluginManager.parameters('HitCounter');
    const variableId = Number(parameters['VariableID'] || 13);
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        if (target.isActor() && target.result().isHit()) {
            const current = $gameVariables.value(variableId);
            $gameVariables.setValue(variableId, current + 1);
        }
    };
})();
