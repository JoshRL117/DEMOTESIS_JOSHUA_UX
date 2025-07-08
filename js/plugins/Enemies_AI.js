/*:
 * @plugindesc AI RNEAT: Entrena cada 3 turnos, guarda datos reales y decide acción enemiga con NEAT.
 * Variables entradas: 11,12,13,14 | Vida antes/después: 20,21,22,23
 * @author Joshua
 */

(function () {
  const fs = require('fs');
  const pathDatos = "C:/Users/joshu/Desktop/DEMOTESIS_JOSHUA_UX/js/datos_reales.json";

  const RNEATActions = {
    0: 1,   // Ataque
    1: 7,   // Defensa
    2: 10,  // Curar
    3: 15   // Ataque triple
  };

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  function evaluarRedNEAT(inputs, modelPath) {
    try {
      const raw = fs.readFileSync(modelPath);
      const model = JSON.parse(raw);

      const nodeValues = {};
      const inputsIds = model.nodes.slice(0, 4).map(n => n.id);
      const outputIds = model.nodes.slice(-4).map(n => n.id);

      for (let i = 0; i < inputs.length; i++) {
        nodeValues[inputsIds[i]] = inputs[i];
      }

      const allConns = model.connections;
      const allNodes = model.nodes.map(n => n.id);
      const remainingNodes = allNodes.filter(n => !inputsIds.includes(n));

      for (let nodeId of remainingNodes) {
        const incoming = allConns.filter(c => c.out === nodeId);
        let sum = 0;
        for (let conn of incoming) {
          const inputVal = nodeValues[conn.in] || 0;
          sum += inputVal * conn.weight;
        }
        nodeValues[nodeId] = sigmoid(sum);
      }

      const salida = outputIds.map(id => nodeValues[id] || 0);
      return softmax(salida);
    } catch (e) {
      console.error("❌ Error al evaluar red NEAT:", e);
      return [0.5, 0.5, 0.5, 0.5];
    }
  }

  function leerDatosJSON(path) {
    try {
      if (fs.existsSync(path)) {
        const contenido = fs.readFileSync(path, 'utf8');
        return JSON.parse(contenido);
      }
      return [];
    } catch (e) {
      console.error("Error leyendo JSON:", e);
      return [];
    }
  }

  function guardarDatosJSON(path, datos) {
    try {
      fs.writeFileSync(path, JSON.stringify(datos, null, 2), 'utf8');
      console.log("📁 Datos JSON guardados correctamente.");
    } catch (e) {
      console.error("Error guardando JSON:", e);
    }
  }

  let ultimaSalidaRed = [1, 0, 0, 0];

  function agregarEpisodio(entradas, vPartyAntes, vPartyDespues, vEnemigosAntes, vEnemigosDespues) {
  let historialDatos = leerDatosJSON(pathDatos);

  if (historialDatos.length >= 10) {
    historialDatos = historialDatos.slice(historialDatos.length - 9);
  }

  historialDatos.push({
    entradas: entradas,
    vida_party_antes: vPartyAntes,
    vida_party_despues: vPartyDespues,
    vida_enemigos_antes: vEnemigosAntes,
    vida_enemigos_despues: vEnemigosDespues
  });

  guardarDatosJSON(pathDatos, historialDatos);
  }


  const _BattleManager_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function () {
    _BattleManager_startTurn.call(this);
    let vidaPartyAntes = $gameParty.aliveMembers().reduce((sum, actor) => sum + actor.hp, 0);
    let vidaEnemigosAntes = $gameTroop.aliveMembers().reduce((sum, enemy) => sum + enemy.hp, 0);
    $gameVariables.setValue(20, vidaPartyAntes);
    $gameVariables.setValue(22, vidaEnemigosAntes);
  };

  const _BattleManager_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function () {
    _BattleManager_endTurn.call(this);

    let vidaPartyDespues = $gameParty.aliveMembers().reduce((sum, actor) => sum + actor.hp, 0);
    let vidaEnemigosDespues = $gameTroop.aliveMembers().reduce((sum, enemy) => sum + enemy.hp, 0);
    $gameVariables.setValue(21, vidaPartyDespues);
    $gameVariables.setValue(23, vidaEnemigosDespues);

    const turno = $gameVariables.value(14);
    if (turno % 3 === 0) {
      try {
        const { execSync } = require('child_process');
        console.log("🧠 Entrenando modelo NEAT...");
        execSync('python "C:/Users/joshu/Desktop/DEMOTESIS_JOSHUA_UX/AI_model_josh.py"', { stdio: 'inherit' });
        console.log("✅ Modelo entrenado");

        const entradas = [
          $gameVariables.value(11),
          $gameVariables.value(12),
          $gameVariables.value(13),
          turno
        ];

        agregarEpisodio(
          entradas,
          $gameVariables.value(20),
          $gameVariables.value(21),
          $gameVariables.value(22),
          $gameVariables.value(23)
        );

        ultimaSalidaRed = evaluarRedNEAT(entradas, "C:/Users/joshu/Desktop/DEMOTESIS_JOSHUA_UX/js/rneat_model.json");
      } catch (error) {
        console.error("❌ Error al entrenar/evaluar:", error);
      }
    }

    console.log("📊 Variables actuales:");
    console.log("Turno:", turno);
    console.log("Party antes:", $gameVariables.value(20), "→ después:", $gameVariables.value(21));
    console.log("Enemigos antes:", $gameVariables.value(22), "→ después:", $gameVariables.value(23));
    console.log("🔁 Última salida red:", ultimaSalidaRed);

    const index = ultimaSalidaRed.indexOf(Math.max(...ultimaSalidaRed));
    const skillId = RNEATActions[index];

    const enemigosVivos = $gameTroop.aliveMembers();
    if (enemigosVivos.length > 0) {
      try {
        enemigosVivos.forEach(enemy => {
          if (enemy && !enemy.isDead()) {
            enemy.forceAction(skillId, -1);
          }
        });
      } catch (error) {
        console.error("Error al asignar acción a enemigos:", error);
      }
    }
      };
  const _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
  Scene_Battle.prototype.terminate = function() {
    $gameVariables.setValue(14, 0);
    $gameVariables.setValue(20, 0);
    $gameVariables.setValue(21, 0);
    $gameVariables.setValue(22, 0);
    $gameVariables.setValue(23, 0);
    console.log("🔄 Variables reiniciadas tras terminar el combate.");
    _Scene_Battle_terminate.call(this);
  };
})();
