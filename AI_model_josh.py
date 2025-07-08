import neat
import numpy as np
import json
import pickle

# === Función softmax ===
def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

# === Cargar datos reales desde JSON ===
def cargar_datos_reales(path="C:/Users/joshu/Desktop/DEMOTESIS_JOSHUA_UX/js/datos_reales.json"):
    with open(path, 'r') as f:
        return json.load(f)

# === Evaluar red con datos reales (fitness) ===
def evaluate_network_on_real_data(net, datos):
    total_reward = 0
    for episodio in datos:
        entradas = episodio["entradas"]
        salida = net.activate(entradas)
        salida_probs = softmax(salida)

        v_party_antes = episodio["vida_party_antes"]
        v_party_despues = episodio["vida_party_despues"]
        v_enemigos_antes = episodio["vida_enemigos_antes"]
        v_enemigos_despues = episodio["vida_enemigos_despues"]

        if v_party_antes == 0 or v_enemigos_antes == 0:
            continue

        norm_party = (v_party_antes - v_party_despues) / v_party_antes
        norm_enemigos = (v_enemigos_antes - v_enemigos_despues) / v_enemigos_antes
        reward = norm_party - norm_enemigos
        total_reward += reward
    return total_reward

# === Evaluar los genomas ===
def eval_genomes(genomes, config):
    datos = cargar_datos_reales()
    for _, genome in genomes:
        net = neat.nn.FeedForwardNetwork.create(genome, config)
        fitness = evaluate_network_on_real_data(net, datos)
        genome.fitness = fitness

# === Exportar modelo para RPG Maker ===
def export_to_json(genome, config, filename="C:/Users/joshu/Desktop/DEMOTESIS1/js/rneat_model.json"):
    export_data = {'nodes': [], 'connections': []}
    for conn_key, conn in genome.connections.items():
        if conn.enabled:
            export_data['connections'].append({
                'in': conn_key[0],
                'out': conn_key[1],
                'weight': conn.weight
            })
    for node_id in genome.nodes.keys():
        export_data['nodes'].append({'id': node_id})
    with open(filename, 'w') as f:
        json.dump(export_data, f, indent=2)

# === Cargar entradas actuales desde RPG Maker ===
def cargar_inputs_actuales(path="C:/Users/joshu/Desktop/DEMOTESIS1/js/inputs_actuales.json"):
    with open(path, 'r') as f:
        return json.load(f)

# === Guardar salida del modelo evaluado ===
def guardar_salida(salida, path="C:/Users/joshu/Desktop/DEMOTESIS1/js/salida_modelo.json"):
    with open(path, 'w') as f:
        # Convertir numpy.ndarray a lista para JSON
        json.dump({'salida': salida.tolist()}, f, indent=2)

# === Entrenamiento + evaluación ===
def run():
    config_path = "C:/Users/joshu/Desktop/DEMOTESIS1/or_neat_config.txt"
    config = neat.Config(
        neat.DefaultGenome,
        neat.DefaultReproduction,
        neat.DefaultSpeciesSet,
        neat.DefaultStagnation,
        config_path
    )

    pop = neat.Population(config)
    pop.add_reporter(neat.StdOutReporter(True))
    stats = neat.StatisticsReporter()
    pop.add_reporter(stats)

    winner = pop.run(eval_genomes, 10)  # Solo 10 generaciones por rapidez

    # Exportar modelo entrenado
    export_to_json(winner, config)

    # Evaluar modelo con entradas actuales
    net = neat.nn.FeedForwardNetwork.create(winner, config)
    entradas = cargar_inputs_actuales()
    salida = softmax(net.activate(entradas))

    # Guardar la salida en JSON
    guardar_salida(salida)

if __name__ == "__main__":
    run()
