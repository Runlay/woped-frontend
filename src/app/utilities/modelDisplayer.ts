import * as vis from 'vis';
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';

// Model Display Class
export class ModelDisplayer {
  // Preprocessing of the Petri net model. The model is converted into a format (domparser) that can be displayed by the library.
  public static async generatePetriNet(modelAsPetriNet: string) {
    try {
      let domparser = new DOMParser();
      const xmlDoc = domparser.parseFromString(modelAsPetriNet, 'text/xml');
      ModelDisplayer.displayPNMLModel(xmlDoc);
    } catch (err) {
      console.log(err);
    }
  }

  // Displays the BPMN model. Sets the representation in the HTML element "model-container".
  public static displayPNMLModel(petrinet: any) {
    let generateWorkFlowNet = false; //Determines wether WoPeD specific Elements like XOR Split are created
    const prettyPetriNet = getPetriNet(petrinet);
    let gateways = [];

    generatePetrinetConfig(prettyPetriNet);
    function generatePetrinetConfig(petrinet) {
      const data = getVisElements(petrinet);

      // create a network
      const container = document.getElementById('model-container');

      const options = {
        layout: {
          randomSeed: undefined,
          improvedLayout: true,
          hierarchical: {
            enabled: true,
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
            direction: 'LR', // UD, DU, LR, RL
            sortMethod: 'directed', // hubsize, directed
          },
        },
        groups: {
          places: {
            color: { background: '#4DB6AC', border: '#00695C' },
            borderWidth: 3,
            shape: 'circle',
          },
          transitions: {
            color: { background: '#FFB74D', border: '#FB8C00' },
            shape: 'square',
            borderWidth: 3,
          },
          andJoin: {
            color: { background: '#DCE775', border: '#9E9D24' },
            shape: 'square',
            borderWidth: 3,
          },
          andSplit: {
            color: { background: '#DCE775', border: '#9E9D24' },
            shape: 'square',
            borderWidth: 3,
          },
          xorSplit: {
            color: { background: '#9575CD', border: '#512DA8' },
            shape: 'square',
            borderWidth: 3,
            image: '/img/and_split.svg',
          },
          xorJoin: {
            color: { background: '#9575CD', border: '#512DA8' },
            shape: 'square',
            borderWidth: 3,
          },
        },
        interaction: {
          zoomView: true,
          dragView: true,
        },
      };
      // initialize your network!
      const network = new vis.Network(container, data, options);
    }

    function getPetriNet(PNML) {
      const places = PNML.getElementsByTagName('place');
      const transitions = PNML.getElementsByTagName('transition');
      const arcs = PNML.getElementsByTagName('arc');

      const petrinet = {
        places: [],
        transitions: [],
        arcs: [],
      };

      for (let x = 0; x < arcs.length; x++) {
        const arc = arcs[x];
        petrinet.arcs.push({
          id: arc.getAttribute('id'),
          source: arc.getAttribute('source'),
          target: arc.getAttribute('target'),
        });
      }

      for (let x = 0; x < places.length; x++) {
        const place = places[x];
        petrinet.places.push({
          id: place.getAttribute('id'),
          label: place.getElementsByTagName('text')[0].textContent,
        });
      }

      for (let x = 0; x < transitions.length; x++) {
        const transition = transitions[x];
        const isGateway =
          transition.getElementsByTagName('operator').length > 0;
        let gatewayType = undefined;
        let gatewayID = undefined;
        if (isGateway) {
          gatewayType = transition
            .getElementsByTagName('operator')[0]
            .getAttribute('type');
          gatewayID = transition
            .getElementsByTagName('operator')[0]
            .getAttribute('id');
        }
        petrinet.transitions.push({
          id: transition.getAttribute('id'),
          label: transition.getElementsByTagName('text')[0].textContent,
          isGateway: isGateway,
          gatewayType: gatewayType,
          gatewayID: gatewayID,
        });
      }
      return petrinet;
    }

    function resetGatewayLog() {
      gateways = [];
    }

    function logContainsGateway(transition) {
      for (let x = 0; x < gateways.length; x++) {
        if (gateways[x].gatewayID === transition.gatewayID) return true;
      }
      return false;
    }
    // Identifies the Gateways
    function logGatewayTransition(transition) {
      if (logContainsGateway(transition) === true) {
        for (let x = 0; x < gateways.length; x++) {
          if (gateways[x].gatewayID === transition.gatewayID)
            gateways[x].transitionIDs.push({ transitionID: transition.id });
        }
      } else {
        gateways.push({
          gatewayID: transition.gatewayID,
          transitionIDs: [{ transitionID: transition.id }],
        });
      }
    }

    function getGatewayIDsforReplacement(arc) {
      const replacement = { source: null, target: null };
      for (let x = 0; x < gateways.length; x++) {
        for (let i = 0; i < gateways[x].transitionIDs.length; i++) {
          if (arc.source === gateways[x].transitionIDs[i].transitionID) {
            replacement.source = gateways[x].gatewayID;
          }
          if (arc.target === gateways[x].transitionIDs[i].transitionID) {
            replacement.target = gateways[x].gatewayID;
          }
        }
      }
      return replacement;
    }

    function replaceGatewayArcs(arcs) {
      for (let x = 0; x < arcs.length; x++) {
        const replacement = getGatewayIDsforReplacement(arcs[x]);
        if (replacement.source !== null) {
          arcs[x].source = replacement.source;
        }
        if (replacement.target !== null) {
          arcs[x].target = replacement.target;
        }
      }
    }

    function getVisElements(PetriNet) {
      // provide the data in the vis format
      const edges = new vis.DataSet([]);
      const nodes = new vis.DataSet([]);
      for (let x = 0; x < PetriNet.places.length; x++) {
        nodes.add({
          id: PetriNet.places[x].id,
          group: 'places',
          label: PetriNet.places[x].label,
        });
      }

      for (let x = 0; x < PetriNet.transitions.length; x++) {
        if (
          !PetriNet.transitions[x].isGateway ||
          generateWorkFlowNet === false
        ) {
          nodes.add({
            id: PetriNet.transitions[x].id,
            group: 'transitions',
            label: PetriNet.transitions[x].id,
            title: PetriNet.transitions[x].label,
          });
        } else {
          let gatewayGroup = '';
          const label = '';
          switch (PetriNet.transitions[x].gatewayType) {
            case '101':
              gatewayGroup = 'andSplit';
              break;
            case '102':
              gatewayGroup = 'andJoin';
              break;
            case '104':
              gatewayGroup = 'xorSplit';
              break;
            case '105':
              gatewayGroup = 'xorJoin';
              break;
          }
          if (!logContainsGateway(PetriNet.transitions[x])) {
            nodes.add({
              id: PetriNet.transitions[x].gatewayID,
              group: gatewayGroup,
              label: label,
              title: PetriNet.transitions[x].label,
            });
          }
          logGatewayTransition(PetriNet.transitions[x]);
        }
      }

      if (generateWorkFlowNet === true) {
        replaceGatewayArcs(PetriNet.arcs);
      }

      for (let x = 0; x < PetriNet.arcs.length; x++) {
        edges.add({
          from: PetriNet.arcs[x].source,
          to: PetriNet.arcs[x].target,
          arrows: 'to',
        });
      }
      resetGatewayLog();
      return { nodes: nodes, edges: edges };
    }
  }

  public static displayBPMNModel(modelAsBPMN: string) {
    // Empty the Container
    document.getElementById('model-container').innerHTML = '';

    // Create a new Viewer
    const viewer = new BpmnJS({
      container: '#model-container',
      keyboard: {
        bindTo: window,
      },
    });

    try {
      // Display the BPMN Model
      viewer.importXML(modelAsBPMN);
      viewer.get('canvas').zoom('fit-viewport');
    } catch (err) {}
  }
}
