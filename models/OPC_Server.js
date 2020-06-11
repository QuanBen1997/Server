/* global require */
var async = require('asyncawait/async');
var await = require('asyncawait/await');
const opcua = require('node-opcua');
var ip = require("ip");
var os = require ("os");
var path = require("path");
var variableconfig = require("../module/variableconfig.json");
//datatype mapping Var and OPC UA standards
const moduleTypesMap = 
{
    'Bool' : 'Boolean',
    'Real' : 'Float',
    'Double' : 'Double',
    'Byte' : 'Byte',
    'Int' : 'Int16',
    'DInt' : 'Int32',
    'LInt' : 'Int64',
    'UInt' : 'UInt16',
    'UDInt' : 'UInt32',
    'ULInt' : 'UInt64',    
    'String' : 'String',
    'Word' : 'UInt16',
    'DWord' : 'UInt32',
};
const moduleTypesCodeMap = 
{
    'Boolean' : opcua.DataType.Boolean,
    'Float' : opcua.DataType.Float,
    'Double' : opcua.DataType.Double,
    'Byte' : opcua.DataType.Byte,
    'Int16' : opcua.DataType.Int16,
    'Int32' : opcua.DataType.Int32,
    'Int64' : opcua.DataType.Int64,
    'UInt16' : opcua.DataType.UInt16,
    'UInt32' : opcua.DataType.UInt32,
    'UInt64' : opcua.DataType.UInt64,
    'String' : opcua.DataType.String
};
function opcuaInitializeAsync(server) 
{
    return new Promise(function(res, err)
    {
        server.initialize(function ()
        {
            return res();
        });			
	});
}
function opcuaStartAsync (server)
{
    return new Promise(function (res, err)
    {
            server.start(function () 
            {
                const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                console.log("The primary Server endpoint URL is", endpointUrl);
                return res();
            });
    });
}

module.exports.startAsync = async (function (options)
{
    var moduleData = {};
    //Read hostname and IPAddress
    var ipAddress = ip.address();
    var propertiesAllVariable = [];
    var arraySessionCreated = [];
    var arraySessionClosed = [];
    var arrayPropertiesOfDevice = [];
    var arrayAllNodeID = [];

    moduleData.server = new opcua.OPCUAServer(options);
    // Initalize the server
    try
    {
        await (opcuaInitializeAsync(moduleData.server));
    }
    catch (e)
    {
        console.log("OPCUA Server initialization failed : " + e);
    }  
    
    const addressSpace =  moduleData.server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();
              // declare a new object
              const device = namespace.addObject({
                organizedBy: addressSpace.rootFolder.objects,
                browseName: "simulation",
              });
              arrayPropertiesOfDevice.push(device);
              var random = 0;
              setInterval(function () {
                random += Math.round(11 + Math.random() * (-5 - 5));
                if (random >= 100) {
                  random = 0;
                }
              }, 2000);
              var variable1 = namespace.addVariable({
                componentOf: device,
                browseName: "random",
                nodeId: 'ns=1;s=simulation.random',
                dataType: "Int16",
                value: {
                  // Getter and Setter value , data type from Count_value
                  get: function () {
                    let variant = new opcua.Variant({
                      dataType: opcua.DataType.Int16,
                      value: random,
                    });
                    return variant;
                  },
                  set: function (variant) {
                    random = parseInt(variant.value);
                    return opcua.StatusCodes.Good;
                  },
                },
              });
              arrayAllNodeID.push(variable1);
    
              let propertiesCountVariable1 = {
                deviceName: "simulation",
                properties: {
                  nodeId: 'ns=1;s=simulation.random',
                  name: "random",
                  dataType: "Int16",
                  writable: true,
                },
              };
              let propertiesCountVariable2 = {
                deviceName: "simulation",
                properties: {
                  nodeId: "ns=1;s=free_memory",
                  name: "freeMemory",
                  dataType: "Double",
                  writable: false,
                },
              };
              propertiesAllVariable.push(propertiesCountVariable1);
              propertiesAllVariable.push(propertiesCountVariable2);
              // Add variable
              var uaNodeList = [];
              //for each device add one folder and its variables
              function opcuaAddDevice(
                nameDevice,
                DataSet,
                uaNodeList,
                addressSpace,
                namespace
              ) {
                // Add device object node to the namespace
                let device = namespace.addObject({
                  organizedBy: addressSpace.rootFolder.objects,
                  browseName: nameDevice,
                });
                arrayPropertiesOfDevice.push(device);
                // Add each tag (variable) to server
                for (let j = 0; j < DataSet.variablesList.length; j++) {
                  let variable = DataSet.variablesList[j];
                  let setID = 'ns=1;s=' + nameDevice + '.' + variable.name ;
                  let myValue = variable.value;
                  let propertiesVariable = {
                    deviceName: nameDevice,
                    properties: {
                      nodeId: setID,
                      name: variable.name,
                      dataType: variable.dataType,
                      writable: DataSet.variablesList[j].writable,
                    },
                  };
                  propertiesAllVariable.push(propertiesVariable);
                  if (!DataSet.variablesList[j].writable) {
                    var variableBefore = namespace.addVariable({
                      componentOf: device,
                      browseName: variable.name,
                      dataType: moduleTypesMap[variable.dataType],
                      nodeId: setID,
                      value: {
                        get: function () {
                          let mydataType =
                            moduleTypesCodeMap[moduleTypesMap[variable.dataType]];
                          let variant = new opcua.Variant({
                            dataType: mydataType,
                            value: myValue,
                          });
                          return variant;
                        },
                        set: function (variant) {
                          return opcua.StatusCodes.BadNotWritable;
                        },
                      },
                    });
                    arrayAllNodeID.push(variableBefore);
                  } else {
                    var variableAfter = namespace.addVariable({
                      componentOf: device,
                      browseName: variable.name,
                      dataType: moduleTypesMap[variable.dataType],
                      nodeId: setID,
                      value: {
                        get: function () {
                          let mydataType =
                            moduleTypesCodeMap[moduleTypesMap[variable.dataType]];
                          let variant = new opcua.Variant({
                            dataType: mydataType,
                            value: myValue,
                          });
                          return variant;
                        },
                        set: function (variant) {
                          myValue = variant.value;
                          return opcua.StatusCodes.Good;
                        },
                      },
                    });
                    arrayAllNodeID.push(variableAfter);
                  }
                }
                uaNodeList.push(device);
              }
    
              for (let i = 0; i < variableconfig.Data.length; i++) {
                let nameDevice = variableconfig.Data[i].deviceName;
                opcuaAddDevice(
                  nameDevice,
                  variableconfig.Data[i],
                  uaNodeList,
                  addressSpace,
                  namespace
                );
              }
              /**
               * returns the percentage of free memory on the running machine
               * @return {double}
               */
              function available_memory() {
                // var value = process.memoryUsage().heapUsed / 1000000;
                const percentageMemUsed = (os.freemem() / os.totalmem()) * 100.0;
                return percentageMemUsed;
              }
              var freeVal = namespace.addVariable({
                componentOf: device,
                nodeId: "s=free_memory", // a string nodeID
                browseName: "freeMemory",
                dataType: "Double",
                value: {
                  get: function () {
                    return new opcua.Variant({
                      dataType: opcua.DataType.Double,
                      value: available_memory(),
                    });
                  },
                },
              });
              arrayAllNodeID.push(freeVal);
              
              // Store variable and device name on array
              var dataArray = [];
              var object = addressSpace.rootFolder.objects;  
              var deviceObject = Object.keys(object).slice(9,Object.keys(object).length );
              dataArray.push(deviceObject);
              for (const iterator1 of deviceObject) {
                let objectEachDevice = Object.keys(object[iterator1]).slice(8, Object.keys(object[iterator1]).length);
                dataArray.push(objectEachDevice);
              }
              moduleData.dataArray = dataArray;  
              try
            {
            await (opcuaStartAsync(moduleData.server));
            }
            catch (e)
            {
            console.log("OPCUA Server start failed : " + e);
            }
              console.log("Server is now listening ... ( press CTRL+C to stop)");
              const port = options.port;
              const endpointUrl = moduleData.server.endpoints[0].endpointDescriptions()[0].endpointUrl;
              console.log("Primary server endpoint url is : ", endpointUrl);
              const alternateHostnames ="opc.tcp://" + ipAddress + ":" + port + options.resourcePath;
              console.log( "Alternative server endpoint url is : ",alternateHostnames );
              console.log("Server is ready !");
              //send endpoints of server and properties of all variable
          
    
          // get session active from server 
          moduleData.server.on("create_session", function (session) {
            console.log(" SESSION CREATED");
            console.log( "    client application URI: ",session.clientDescription.applicationUri);
            console.log("        client product URI: ",session.clientDescription.productUri);
            console.log("   client application name: ",session.clientDescription.applicationName.toString());
            console.log("   client application type: ",session.clientDescription.applicationType.toString());
            console.log("              session name: ",session.sessionName ? session.sessionName.toString() : "<null>");
            console.log("           session timeout: ", session.sessionTimeout);
            console.log("                session id: ", session.sessionId);
            // store data about session to send browser
            var securityPolicy = session.channel.securityPolicy;
            var security = "";
            switch (session.channel.endpoint.securityMode) {
              case 1:
                security = "None" + "," + securityPolicy.split("#")[1];
                break;
              case 2:
                security = "Sign" + "," + securityPolicy.split("#")[1];
                break;
              case 3:
                security = "Sign&Encrypt" + "," + securityPolicy.split("#")[1];
                break;
            }
            arraySessionCreated.push({
              Color: getRandomColor(),
              TimeStamp: session.creationDate,
              EventType: "Session Activated",
              SessionName: session.sessionName.toString(),
              ClientIdentity: session.clientDescription.applicationName.text,
              SessionId: session.nodeId.value,
              Secutity: security,
            });
          });
    
          // get setsion closed from server 
          moduleData.server.on("session_closed", function (session) {
            console.log(" SESSION CLOSED");
            console.log("    client application URI: ",session.clientDescription.applicationUri);
            console.log("        client product URI: ",session.clientDescription.productUri);
            console.log("   client application name: ",session.clientDescription.applicationName.toString());
            console.log("   client application type: ",session.clientDescription.applicationType.toString());
            console.log("              session name: ",session.sessionName ? session.sessionName.toString() : "<null>");
            console.log("           session timeout: ", session.sessionTimeout);
            console.log("                session id: ", session.sessionId);
            // store data about session to send browser
            var securityPolicy = session.channel.securityPolicy;
            var security = "";
            switch (session.channel.endpoint.securityMode) {
              case 1:
                security = "None" + "," + securityPolicy.split("#")[1];
                break;
              case 2:
                security = "Sign" + "," + securityPolicy.split("#")[1];
                break;
              case 3:
                security = "Sign&Encrypt" + "," + securityPolicy.split("#")[1];
                break;
            }
            arraySessionClosed.push({
              TimeStamp: session.creationDate,
              EventType: "Session Closed",
              SessionName: session.sessionName.toString(),
              ClientIdentity: session.clientDescription.applicationName.text,
              SessionId: session.nodeId.value,
              Secutity: security,
            });
          });
          // store all properties needded in global variable
          moduleData.allPropertyOfAllVariable = propertiesAllVariable;
          moduleData.arrayPropertiesOfDevice = arrayPropertiesOfDevice;
          moduleData.arraySessionCreated = arraySessionCreated;
          moduleData.arraySessionClosed = arraySessionClosed;
          moduleData.arrayAllNodeID = arrayAllNodeID;
          moduleData.stateServer = true ;  
    return moduleData;
});

function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

