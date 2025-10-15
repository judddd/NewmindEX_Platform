# Integration Examples

This page provides examples of integrating the newmindflow MCP Server with other systems and AI assistant platforms.

## AI Assistant Integration Examples

### Claude AI Assistant Integration

#### Example: Setting Up newmindflow MCP Server with Claude

```javascript
// Register the newmindflow MCP Server with Claude using the MCP Installer
const installationResult = await useMcpTool('mcp-installer', 'install_repo_mcp_server', {
  name: 'newmindflow-mcp-server',
  env: [
    "N8N_API_URL=http://localhost:5678/api/v1",
    "N8N_API_KEY=your_newmindflow_api_key_here",
    "DEBUG=false"
  ]
});

// Once registered, Claude can interact with newmindflow
// Here's an example conversation:

// User: "Show me my active workflows in newmindflow"
// Claude: (uses workflow_list tool to retrieve and display active workflows)

// User: "Execute my 'Daily Report' workflow"
// Claude: (uses execution_run tool to start the workflow and provide status)
```

#### Example: Using newmindflow to Extend Claude's Capabilities

```javascript
// Using newmindflow as a bridge to external systems 
// This example shows how Claude can access a database through newmindflow

// User: "Show me the top 5 customers from my database"
// Claude would:

// 1. Find the appropriate workflow
const workflows = await useMcpTool('newmindflow-mcp-server', 'workflow_list', {});
const dbQueryWorkflow = workflows.find(w => 
  w.name.toLowerCase().includes('database query') || 
  w.name.toLowerCase().includes('db query')
);

if (!dbQueryWorkflow) {
  return "I couldn't find a database query workflow. Would you like me to help you create one?";
}

// 2. Execute the workflow with the appropriate parameters
const execution = await useMcpTool('newmindflow-mcp-server', 'execution_run', {
  workflowId: dbQueryWorkflow.id,
  data: {
    query: "SELECT * FROM customers ORDER BY total_purchases DESC LIMIT 5",
    format: "table"
  },
  waitForCompletion: true
});

// 3. Present the results to the user
if (execution.status !== "success") {
  return "There was an error querying the database. Error: " + (execution.error || "Unknown error");
}

// Format the results as a table
const customers = execution.data.resultData.runData.lastNode[0].data.json;
let response = "# Top 5 Customers\n\n";
response += "| Customer Name | Email | Total Purchases |\n";
response += "|--------------|-------|----------------|\n";

customers.forEach(customer => {
  response += `| ${customer.name} | ${customer.email} | $${customer.total_purchases.toFixed(2)} |\n`;
});

return response;
```

### OpenAI Assistant Integration

#### Example: Connecting newmindflow MCP Server to OpenAI Assistant

```javascript
// This is a conceptual example of how an OpenAI Assistant might interact with the newmindflow MCP Server

// In an OpenAI Assistant Function definition:
{
  "name": "newmindflow_workflow_list",
  "description": "List all workflows in newmindflow",
  "parameters": {
    "type": "object",
    "properties": {
      "active": {
        "type": "boolean",
        "description": "Filter by active status (optional)"
      }
    }
  }
}

// The function would call the newmindflow MCP Server:
async function newmindflow_workflow_list(params) {
  // Call the newmindflow MCP Server API
  const response = await fetch('http://localhost:3000/newmindflow-mcp/tools/workflow_list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify(params)
  });
  
  return await response.json();
}

// The OpenAI Assistant would then use this function when asked about newmindflow workflows
```

## Integration with External Systems

### newmindflow to Git Integration

#### Example: Using newmindflow MCP Server to Manage Workflow Versioning in Git

```javascript
// User request: "Backup all my workflows to my Git repository"

// The assistant first creates a workflow for Git backup
const backupWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "Workflow Git Backup",
  active: false,
  nodes: [
    {
      name: "Manual Trigger",
      type: "newmindflow-nodes-base.manualTrigger",
      position: [100, 300],
      parameters: {}
    },
    {
      name: "Get All Workflows",
      type: "newmindflow-nodes-base.newmindflow",
      position: [300, 300],
      parameters: {
        resource: "workflow",
        operation: "getAll"
      }
    },
    {
      name: "Format For Git",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
// Convert workflows to individual JSON files
const workflows = items;
const outputItems = [];

for (const workflow of workflows) {
  // Create a sanitized filename
  const filename = workflow.json.name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase() + '.json';
  
  outputItems.push({
    json: {
      filename: filename,
      content: JSON.stringify(workflow.json, null, 2),
      commit_message: \`Backup workflow: \${workflow.json.name}\`
    }
  });
}

return outputItems;
`
      }
    },
    {
      name: "Git Commit",
      type: "newmindflow-nodes-base.git",
      position: [700, 300],
      parameters: {
        repository: "{{$env.GIT_REPO_PATH}}",
        directory: "workflows",
        operation: "commit",
        message: "Automated workflow backup {{$now.format('YYYY-MM-DD HH:mm')}}",
        filePath: "={{$json.filename}}",
        fileContent: "={{$json.content}}"
      }
    },
    {
      name: "Git Push",
      type: "newmindflow-nodes-base.git",
      position: [900, 300],
      parameters: {
        repository: "{{$env.GIT_REPO_PATH}}",
        operation: "push"
      }
    }
  ],
  connections: {
    "Manual Trigger": {
      main: [
        [
          {
            node: "Get All Workflows",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get All Workflows": {
      main: [
        [
          {
            node: "Format For Git",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Format For Git": {
      main: [
        [
          {
            node: "Git Commit",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Git Commit": {
      main: [
        [
          {
            node: "Git Push",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

return `
# Git Backup Workflow Created

I've created a new workflow that will backup all your newmindflow workflows to Git.

**Workflow ID:** ${backupWorkflow.id}

## Configuration Needed:
1. The workflow is currently **inactive** - activate it once configured
2. Set the environment variable \`GIT_REPO_PATH\` to point to your Git repository
3. Ensure the Git repository is properly configured with credentials

## How It Works:
- When executed, this workflow retrieves all newmindflow workflows
- Converts each workflow to a JSON file
- Commits each file to the specified Git repository
- Pushes the changes to the remote repository

## Usage:
You can run this workflow manually whenever you want to backup your workflows,
or add a Schedule Trigger to automate regular backups.
`;
```

### CRM Integration

#### Example: Setting Up a Two-Way Sync Between newmindflow and a CRM

```javascript
// User request: "Help me set up a sync between newmindflow and my HubSpot CRM"

// First check for existing credentials
const workflows = await useMcpTool('newmindflow-mcp-server', 'workflow_list', {});
const hubspotWorkflows = workflows.filter(w => 
  w.name.toLowerCase().includes('hubspot')
);

let credentialsMessage = "";
if (hubspotWorkflows.length > 0) {
  credentialsMessage = "I noticed you already have HubSpot workflows. I'll assume you have HubSpot credentials set up.";
} else {
  credentialsMessage = "You'll need to set up HubSpot credentials in newmindflow before activating this workflow.";
}

// Create the sync workflow
const syncWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "HubSpot Two-Way Sync",
  active: false,
  nodes: [
    {
      name: "Schedule Trigger",
      type: "newmindflow-nodes-base.scheduleTrigger",
      position: [100, 300],
      parameters: {
        cronExpression: "0 */2 * * *" // Every 2 hours
      }
    },
    {
      name: "Get HubSpot Contacts",
      type: "newmindflow-nodes-base.hubspot",
      position: [300, 200],
      parameters: {
        resource: "contact",
        operation: "getAll",
        returnAll: true,
        additionalFields: {
          formattedDate: true
        }
      }
    },
    {
      name: "Get newmindflow Contacts",
      type: "newmindflow-nodes-base.function",
      position: [300, 400],
      parameters: {
        functionCode: `
// This function would retrieve contacts from your internal database
// For example purposes, we're using a placeholder
// In reality, you might use another newmindflow node to fetch from your database

return [
  {
    json: {
      internalContacts: [
        // Example internal contacts
        // In a real scenario, these would come from your database
      ]
    }
  }
];
`
      }
    },
    {
      name: "Compare & Identify Changes",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
const hubspotContacts = $input.first();
const internalContacts = $input.last().json.internalContacts;

// Identify new/updated contacts in HubSpot
const hubspotUpdates = hubspotContacts.json.map(contact => {
  // Find matching internal contact by email
  const internalMatch = internalContacts.find(
    ic => ic.email === contact.properties.email
  );
  
  if (!internalMatch) {
    return {
      json: {
        type: 'new_in_hubspot',
        contact: contact,
        action: 'create_in_internal'
      }
    };
  }
  
  // Check if HubSpot contact is newer
  const hubspotUpdated = new Date(contact.properties.lastmodifieddate);
  const internalUpdated = new Date(internalMatch.updated_at);
  
  if (hubspotUpdated > internalUpdated) {
    return {
      json: {
        type: 'updated_in_hubspot',
        contact: contact,
        action: 'update_in_internal'
      }
    };
  }
  
  return null;
}).filter(item => item !== null);

// Identify new/updated contacts in internal system
const internalUpdates = internalContacts.map(contact => {
  // Find matching HubSpot contact by email
  const hubspotMatch = hubspotContacts.json.find(
    hc => hc.properties.email === contact.email
  );
  
  if (!hubspotMatch) {
    return {
      json: {
        type: 'new_in_internal',
        contact: contact,
        action: 'create_in_hubspot'
      }
    };
  }
  
  // Check if internal contact is newer
  const internalUpdated = new Date(contact.updated_at);
  const hubspotUpdated = new Date(hubspotMatch.properties.lastmodifieddate);
  
  if (internalUpdated > hubspotUpdated) {
    return {
      json: {
        type: 'updated_in_internal',
        contact: contact,
        action: 'update_in_hubspot'
      }
    };
  }
  
  return null;
}).filter(item => item !== null);

// Combine all changes
return [...hubspotUpdates, ...internalUpdates];
`
      }
    },
    {
      name: "Route Updates",
      type: "newmindflow-nodes-base.switch",
      position: [700, 300],
      parameters: {
        rules: {
          conditions: [
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "update_in_hubspot"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "create_in_hubspot"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "update_in_internal"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "create_in_internal"
            }
          ]
        }
      }
    },
    {
      name: "Update HubSpot Contact",
      type: "newmindflow-nodes-base.hubspot",
      position: [900, 100],
      parameters: {
        resource: "contact",
        operation: "update",
        contactId: "={{$json.contact.hubspot_id || $json.hubspotId}}",
        additionalFields: {
          properties: {
            firstname: "={{$json.contact.first_name}}",
            lastname: "={{$json.contact.last_name}}",
            email: "={{$json.contact.email}}",
            phone: "={{$json.contact.phone}}",
            // Add additional fields as needed
          }
        }
      }
    },
    {
      name: "Create HubSpot Contact",
      type: "newmindflow-nodes-base.hubspot",
      position: [900, 250],
      parameters: {
        resource: "contact",
        operation: "create",
        additionalFields: {
          properties: {
            firstname: "={{$json.contact.first_name}}",
            lastname: "={{$json.contact.last_name}}",
            email: "={{$json.contact.email}}",
            phone: "={{$json.contact.phone}}",
            // Add additional fields as needed
          }
        }
      }
    },
    {
      name: "Update Internal Contact",
      type: "newmindflow-nodes-base.function",
      position: [900, 400],
      parameters: {
        functionCode: `
// This function would update contacts in your internal database
// In reality, you might use another newmindflow node like a database connector
const contact = $input.first().json.contact;

// Process the HubSpot contact into internal format
const internalFormat = {
  first_name: contact.properties.firstname,
  last_name: contact.properties.lastname,
  email: contact.properties.email,
  phone: contact.properties.phone,
  hubspot_id: contact.id,
  updated_at: new Date().toISOString()
};

// In a real implementation, you would update your database
// For this example, we just return what would be updated
return [{
  json: {
    action: "updated_internal_contact",
    contact: internalFormat
  }
}];
`
      }
    },
    {
      name: "Create Internal Contact",
      type: "newmindflow-nodes-base.function",
      position: [900, 550],
      parameters: {
        functionCode: `
// This function would create new contacts in your internal database
// In reality, you might use another newmindflow node like a database connector
const contact = $input.first().json.contact;

// Process the HubSpot contact into internal format
const internalFormat = {
  first_name: contact.properties.firstname,
  last_name: contact.properties.lastname,
  email: contact.properties.email,
  phone: contact.properties.phone,
  hubspot_id: contact.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// In a real implementation, you would insert into your database
// For this example, we just return what would be created
return [{
  json: {
    action: "created_internal_contact",
    contact: internalFormat
  }
}];
`
      }
    },
    {
      name: "Sync Report",
      type: "newmindflow-nodes-base.function",
      position: [1100, 300],
      parameters: {
        functionCode: `
// Collect all results from previous nodes
const updateHubspot = $input.itemsFrom('Update HubSpot Contact');
const createHubspot = $input.itemsFrom('Create HubSpot Contact');
const updateInternal = $input.itemsFrom('Update Internal Contact');
const createInternal = $input.itemsFrom('Create Internal Contact');

// Generate sync summary
return [{
  json: {
    summary: "Sync Complete",
    timestamp: new Date().toISOString(),
    stats: {
      hubspot_updated: updateHubspot.length,
      hubspot_created: createHubspot.length,
      internal_updated: updateInternal.length,
      internal_created: createInternal.length,
      total_changes: updateHubspot.length + createHubspot.length + 
                    updateInternal.length + createInternal.length
    }
  }
}];
`
      }
    }
  ],
  connections: {
    "Schedule Trigger": {
      main: [
        [
          {
            node: "Get HubSpot Contacts",
            type: "main",
            index: 0
          },
          {
            node: "Get newmindflow Contacts",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get HubSpot Contacts": {
      main: [
        [
          {
            node: "Compare & Identify Changes",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get newmindflow Contacts": {
      main: [
        [
          {
            node: "Compare & Identify Changes",
            type: "main",
            index: 1
          }
        ]
      ]
    },
    "Compare & Identify Changes": {
      main: [
        [
          {
            node: "Route Updates",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Route Updates": {
      main: [
        [
          {
            node: "Update HubSpot Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Create HubSpot Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Update Internal Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Create Internal Contact",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Update HubSpot Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Create HubSpot Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Update Internal Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Create Internal Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

return `
# HubSpot Two-Way Sync Workflow Created

I've created a new workflow that will synchronize contacts between HubSpot and your internal system.

**Workflow ID:** ${syncWorkflow.id}

## Configuration Needed:
1. The workflow is currently **inactive** - activate it once configured
2. ${credentialsMessage}
3. You'll need to customize the "Get newmindflow Contacts", "Update Internal Contact", and "Create Internal Contact" nodes to work with your specific database or storage system

## How It Works:
- Runs every 2 hours (configurable)
- Retrieves contacts from both HubSpot and your internal system
- Compares the data to identify new or updated contacts in either system
- Creates or updates contacts to keep both systems in sync
- Generates a sync report with statistics

## Customization:
You may need to modify the field mappings in the function nodes to match your specific data structure
and add any additional fields that need to be synchronized between the systems.
`;
```

### Slack Integration

#### Example: Creating a Workflow to Send newmindflow Notifications to Slack

```javascript
// User request: "Create a workflow that sends newmindflow execution notifications to Slack"

// Create the notification workflow
const notificationWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "newmindflow Execution Notifications to Slack",
  active: false,
  nodes: [
    {
      name: "Webhook",
      type: "newmindflow-nodes-base.webhook",
      position: [100, 300],
      parameters: {
        path: "newmindflow-notification",
        responseMode: "onReceived",
        options: {
          responseData: "noData"
        }
      }
    },
    {
      name: "Format Slack Message",
      type: "newmindflow-nodes-base.function",
      position: [300, 300],
      parameters: {
        functionCode: `
// Parse webhook data from newmindflow
const data = $input.first().json;
const workflow = data.workflow;
const execution = data.execution;

// Determine status color
let color = "#36a64f"; // Green for success
let icon = "✅";

if (execution.status === "error") {
  color = "#ff0000"; // Red for error
  icon = "❌";
} else if (execution.status === "warning") {
  color = "#ffcc00"; // Yellow for warning
  icon = "⚠️";
}

// Create Slack message blocks
const blocks = [
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": \`\${icon} Workflow \${execution.status === "success" ? "Succeeded" : "Failed"}: \${workflow.name}\`,
      "emoji": true
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": \`*Status:*\\n\${execution.status}\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Execution Time:*\\n\${new Date(execution.startedAt).toLocaleString()}\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Duration:*\\n\${Math.round((new Date(execution.finishedAt) - new Date(execution.startedAt)) / 1000)} seconds\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Mode:*\\n\${execution.mode}\`
      }
    ]
  }
];

// Add error details if present
if (execution.status === "error" && execution.error) {
  blocks.push(
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Error Details:*"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": \`\\\`\\\`\${execution.error.message || "Unknown error"}\\\`\\\`\`
      }
    }
  );
}

// Add link to newmindflow execution
blocks.push(
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": \`<\${data.newmindflowUrl}/workflow/\${workflow.id}|View Workflow> | <\${data.newmindflowUrl}/execution/\${execution.id}|View Execution>\`
    }
  }
);

return [{
  json: {
    blocks: blocks,
    text: \`\${icon} Workflow \${execution.status === "success" ? "Succeeded" : "Failed"}: \${workflow.name}\`,
    channel: "#newmindflow-notifications"
  }
}];
`
      }
    },
    {
      name: "Send to Slack",
      type: "newmindflow-nodes-base.slack",
      position: [500, 300],
      parameters: {
        token: "{{$env.SLACK_TOKEN}}",
        text: "={{$json.text}}",
        channel: "={{$json.channel}}",
        otherOptions: {
          blocks: "={{$json.blocks}}"
        }
      }
    }
  ],
  connections: {
    "Webhook": {
      main: [
        [
          {
            node: "Format Slack Message",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Format Slack Message": {
      main: [
        [
          {
            node: "Send to Slack",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

// Create workflow to set up webhook in newmindflow settings
const setupWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "Configure newmindflow Execution Notifications",
  active: false,
  nodes: [
    {
      name: "Manual Trigger",
      type: "newmindflow-nodes-base.manualTrigger",
      position: [100, 300],
      parameters: {}
    },
    {
      name: "newmindflow Settings",
      type: "newmindflow-nodes-base.newmindflow",
      position: [300, 300],
      parameters: {
        resource: "settings",
        operation: "update",
        values: {
          executionTimeout: 120,
          saveManualExecutions: true,
          saveDataErrorExecution: "all", 
          saveDataSuccessExecution: "all",
          saveExecutionProgress: true,
          executeTimeout: 120,
          maxExecutionTimeout: 300,
          workflowCallerIdsAllowed: [],
          timezone: "UTC",
          executionMode: "regular",
          pushBackend: "websocket",
          webhookDebugEnabled: false,
          webhookUrl: "={{$json.webhookUrl}}",
          logLevel: "info"
        }
      }
    },
    {
      name: "Create Instructions",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
const webhookNode = $input.itemsFrom('Webhook')? $input.itemsFrom('Webhook')[0] : { json: { webhookUrl: "unknown" } };
const webhookUrl = webhookNode.json.webhookUrl;

return [{
  json: {
    instructions: \`
# newmindflow to Slack Notification Setup

I've created two workflows:

1. **newmindflow Execution Notifications to Slack** - This workflow receives execution notifications from newmindflow and sends them to Slack
   - ID: ${notificationWorkflow.id}
   - Webhook URL: \${webhookUrl}

2. **Configure newmindflow Execution Notifications** - This workflow configures newmindflow settings to send notifications
   - ID: ${setupWorkflow.id}

## Next Steps:

1. Create a Slack app and obtain a token with the following permissions:
   - chat:write
   - chat:write.public
   
2. Set the environment variable \`SLACK_TOKEN\` with your Slack token

3. Run the "Configure newmindflow Execution Notifications" workflow after setting the \`webhookUrl\` parameter to:
   \${webhookUrl}

4. Activate the "newmindflow Execution Notifications to Slack" workflow

5. Customize the channel in the "Format Slack Message" node if needed (default is #newmindflow-notifications)

Once completed, you'll receive Slack notifications whenever a workflow execution succeeds or fails!
\`
  }
}];
`
      }
    }
  ],
  connections: {
    "Manual Trigger": {
      main: [
        [
          {
            node: "newmindflow Settings",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "newmindflow Settings": {
      main: [
        [
          {
            node: "Create Instructions",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

// Execute the workflow to get the webhook URL
const execution = await useMcpTool('newmindflow-mcp-server', 'execution_run', {
  workflowId: notificationWorkflow.id,
  waitForCompletion: true
});

// Extract webhook URL from the execution
let webhookUrl = "undefined";
if (execution.status === "success" && execution.data?.resultData?.runData?.Webhook?.[0]?.data?.webhookUrl) {
  webhookUrl = execution.data.resultData.runData.Webhook[0].data.webhookUrl;
}

return `
# newmindflow to Slack Notification Setup

I've created two workflows:

1. **newmindflow Execution Notifications to Slack** - This workflow receives execution notifications from newmindflow and sends them to Slack
   - ID: ${notificationWorkflow.id}
   - Webhook URL: ${webhookUrl}

2. **Configure newmindflow Execution Notifications** - This workflow configures newmindflow settings to send notifications
   - ID: ${setupWorkflow.id}

## Next Steps:

1. Create a Slack app and obtain a token with the following permissions:
   - chat:write
   - chat:write.public
   
2. Set the environment variable \`SLACK_TOKEN\` with your Slack token

3. Run the "Configure newmindflow Execution Notifications" workflow after setting the \`webhookUrl\` parameter to:
   ${webhookUrl}

4. Activate the "newmindflow Execution Notifications to Slack" workflow

5. Customize the channel in the "Format Slack Message" node if needed (default is #newmindflow-notifications)

Once completed, you'll receive Slack notifications whenever a workflow execution completes!
```
# Integration Examples

This page provides examples of integrating the newmindflow MCP Server with other systems and AI assistant platforms.

## AI Assistant Integration Examples

### Claude AI Assistant Integration

#### Example: Setting Up newmindflow MCP Server with Claude

```javascript
// Register the newmindflow MCP Server with Claude using the MCP Installer
const installationResult = await useMcpTool('mcp-installer', 'install_repo_mcp_server', {
  name: 'newmindflow-mcp-server',
  env: [
    "N8N_API_URL=http://localhost:5678/api/v1",
    "N8N_API_KEY=your_newmindflow_api_key_here",
    "DEBUG=false"
  ]
});

// Once registered, Claude can interact with newmindflow
// Here's an example conversation:

// User: "Show me my active workflows in newmindflow"
// Claude: (uses workflow_list tool to retrieve and display active workflows)

// User: "Execute my 'Daily Report' workflow"
// Claude: (uses execution_run tool to start the workflow and provide status)
```

#### Example: Using newmindflow to Extend Claude's Capabilities

```javascript
// Using newmindflow as a bridge to external systems 
// This example shows how Claude can access a database through newmindflow

// User: "Show me the top 5 customers from my database"
// Claude would:

// 1. Find the appropriate workflow
const workflows = await useMcpTool('newmindflow-mcp-server', 'workflow_list', {});
const dbQueryWorkflow = workflows.find(w => 
  w.name.toLowerCase().includes('database query') || 
  w.name.toLowerCase().includes('db query')
);

if (!dbQueryWorkflow) {
  return "I couldn't find a database query workflow. Would you like me to help you create one?";
}

// 2. Execute the workflow with the appropriate parameters
const execution = await useMcpTool('newmindflow-mcp-server', 'execution_run', {
  workflowId: dbQueryWorkflow.id,
  data: {
    query: "SELECT * FROM customers ORDER BY total_purchases DESC LIMIT 5",
    format: "table"
  },
  waitForCompletion: true
});

// 3. Present the results to the user
if (execution.status !== "success") {
  return "There was an error querying the database. Error: " + (execution.error || "Unknown error");
}

// Format the results as a table
const customers = execution.data.resultData.runData.lastNode[0].data.json;
let response = "# Top 5 Customers\n\n";
response += "| Customer Name | Email | Total Purchases |\n";
response += "|--------------|-------|----------------|\n";

customers.forEach(customer => {
  response += `| ${customer.name} | ${customer.email} | $${customer.total_purchases.toFixed(2)} |\n`;
});

return response;
```

### OpenAI Assistant Integration

#### Example: Connecting newmindflow MCP Server to OpenAI Assistant

```javascript
// This is a conceptual example of how an OpenAI Assistant might interact with the newmindflow MCP Server

// In an OpenAI Assistant Function definition:
{
  "name": "newmindflow_workflow_list",
  "description": "List all workflows in newmindflow",
  "parameters": {
    "type": "object",
    "properties": {
      "active": {
        "type": "boolean",
        "description": "Filter by active status (optional)"
      }
    }
  }
}

// The function would call the newmindflow MCP Server:
async function newmindflow_workflow_list(params) {
  // Call the newmindflow MCP Server API
  const response = await fetch('http://localhost:3000/newmindflow-mcp/tools/workflow_list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: JSON.stringify(params)
  });
  
  return await response.json();
}

// The OpenAI Assistant would then use this function when asked about newmindflow workflows
```

## Integration with External Systems

### newmindflow to Git Integration

#### Example: Using newmindflow MCP Server to Manage Workflow Versioning in Git

```javascript
// User request: "Backup all my workflows to my Git repository"

// The assistant first creates a workflow for Git backup
const backupWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "Workflow Git Backup",
  active: false,
  nodes: [
    {
      name: "Manual Trigger",
      type: "newmindflow-nodes-base.manualTrigger",
      position: [100, 300],
      parameters: {}
    },
    {
      name: "Get All Workflows",
      type: "newmindflow-nodes-base.newmindflow",
      position: [300, 300],
      parameters: {
        resource: "workflow",
        operation: "getAll"
      }
    },
    {
      name: "Format For Git",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
// Convert workflows to individual JSON files
const workflows = items;
const outputItems = [];

for (const workflow of workflows) {
  // Create a sanitized filename
  const filename = workflow.json.name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase() + '.json';
  
  outputItems.push({
    json: {
      filename: filename,
      content: JSON.stringify(workflow.json, null, 2),
      commit_message: \`Backup workflow: \${workflow.json.name}\`
    }
  });
}

return outputItems;
`
      }
    },
    {
      name: "Git Commit",
      type: "newmindflow-nodes-base.git",
      position: [700, 300],
      parameters: {
        repository: "{{$env.GIT_REPO_PATH}}",
        directory: "workflows",
        operation: "commit",
        message: "Automated workflow backup {{$now.format('YYYY-MM-DD HH:mm')}}",
        filePath: "={{$json.filename}}",
        fileContent: "={{$json.content}}"
      }
    },
    {
      name: "Git Push",
      type: "newmindflow-nodes-base.git",
      position: [900, 300],
      parameters: {
        repository: "{{$env.GIT_REPO_PATH}}",
        operation: "push"
      }
    }
  ],
  connections: {
    "Manual Trigger": {
      main: [
        [
          {
            node: "Get All Workflows",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get All Workflows": {
      main: [
        [
          {
            node: "Format For Git",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Format For Git": {
      main: [
        [
          {
            node: "Git Commit",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Git Commit": {
      main: [
        [
          {
            node: "Git Push",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

return `
# Git Backup Workflow Created

I've created a new workflow that will backup all your newmindflow workflows to Git.

**Workflow ID:** ${backupWorkflow.id}

## Configuration Needed:
1. The workflow is currently **inactive** - activate it once configured
2. Set the environment variable \`GIT_REPO_PATH\` to point to your Git repository
3. Ensure the Git repository is properly configured with credentials

## How It Works:
- When executed, this workflow retrieves all newmindflow workflows
- Converts each workflow to a JSON file
- Commits each file to the specified Git repository
- Pushes the changes to the remote repository

## Usage:
You can run this workflow manually whenever you want to backup your workflows,
or add a Schedule Trigger to automate regular backups.
`;
```

### CRM Integration

#### Example: Setting Up a Two-Way Sync Between newmindflow and a CRM

```javascript
// User request: "Help me set up a sync between newmindflow and my HubSpot CRM"

// First check for existing credentials
const workflows = await useMcpTool('newmindflow-mcp-server', 'workflow_list', {});
const hubspotWorkflows = workflows.filter(w => 
  w.name.toLowerCase().includes('hubspot')
);

let credentialsMessage = "";
if (hubspotWorkflows.length > 0) {
  credentialsMessage = "I noticed you already have HubSpot workflows. I'll assume you have HubSpot credentials set up.";
} else {
  credentialsMessage = "You'll need to set up HubSpot credentials in newmindflow before activating this workflow.";
}

// Create the sync workflow
const syncWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "HubSpot Two-Way Sync",
  active: false,
  nodes: [
    {
      name: "Schedule Trigger",
      type: "newmindflow-nodes-base.scheduleTrigger",
      position: [100, 300],
      parameters: {
        cronExpression: "0 */2 * * *" // Every 2 hours
      }
    },
    {
      name: "Get HubSpot Contacts",
      type: "newmindflow-nodes-base.hubspot",
      position: [300, 200],
      parameters: {
        resource: "contact",
        operation: "getAll",
        returnAll: true,
        additionalFields: {
          formattedDate: true
        }
      }
    },
    {
      name: "Get newmindflow Contacts",
      type: "newmindflow-nodes-base.function",
      position: [300, 400],
      parameters: {
        functionCode: `
// This function would retrieve contacts from your internal database
// For example purposes, we're using a placeholder
// In reality, you might use another newmindflow node to fetch from your database

return [
  {
    json: {
      internalContacts: [
        // Example internal contacts
        // In a real scenario, these would come from your database
      ]
    }
  }
];
`
      }
    },
    {
      name: "Compare & Identify Changes",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
const hubspotContacts = $input.first();
const internalContacts = $input.last().json.internalContacts;

// Identify new/updated contacts in HubSpot
const hubspotUpdates = hubspotContacts.json.map(contact => {
  // Find matching internal contact by email
  const internalMatch = internalContacts.find(
    ic => ic.email === contact.properties.email
  );
  
  if (!internalMatch) {
    return {
      json: {
        type: 'new_in_hubspot',
        contact: contact,
        action: 'create_in_internal'
      }
    };
  }
  
  // Check if HubSpot contact is newer
  const hubspotUpdated = new Date(contact.properties.lastmodifieddate);
  const internalUpdated = new Date(internalMatch.updated_at);
  
  if (hubspotUpdated > internalUpdated) {
    return {
      json: {
        type: 'updated_in_hubspot',
        contact: contact,
        action: 'update_in_internal'
      }
    };
  }
  
  return null;
}).filter(item => item !== null);

// Identify new/updated contacts in internal system
const internalUpdates = internalContacts.map(contact => {
  // Find matching HubSpot contact by email
  const hubspotMatch = hubspotContacts.json.find(
    hc => hc.properties.email === contact.email
  );
  
  if (!hubspotMatch) {
    return {
      json: {
        type: 'new_in_internal',
        contact: contact,
        action: 'create_in_hubspot'
      }
    };
  }
  
  // Check if internal contact is newer
  const internalUpdated = new Date(contact.updated_at);
  const hubspotUpdated = new Date(hubspotMatch.properties.lastmodifieddate);
  
  if (internalUpdated > hubspotUpdated) {
    return {
      json: {
        type: 'updated_in_internal',
        contact: contact,
        action: 'update_in_hubspot'
      }
    };
  }
  
  return null;
}).filter(item => item !== null);

// Combine all changes
return [...hubspotUpdates, ...internalUpdates];
`
      }
    },
    {
      name: "Route Updates",
      type: "newmindflow-nodes-base.switch",
      position: [700, 300],
      parameters: {
        rules: {
          conditions: [
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "update_in_hubspot"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "create_in_hubspot"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "update_in_internal"
            },
            {
              value1: "={{$json.action}}",
              operation: "equal",
              value2: "create_in_internal"
            }
          ]
        }
      }
    },
    {
      name: "Update HubSpot Contact",
      type: "newmindflow-nodes-base.hubspot",
      position: [900, 100],
      parameters: {
        resource: "contact",
        operation: "update",
        contactId: "={{$json.contact.hubspot_id || $json.hubspotId}}",
        additionalFields: {
          properties: {
            firstname: "={{$json.contact.first_name}}",
            lastname: "={{$json.contact.last_name}}",
            email: "={{$json.contact.email}}",
            phone: "={{$json.contact.phone}}",
            // Add additional fields as needed
          }
        }
      }
    },
    {
      name: "Create HubSpot Contact",
      type: "newmindflow-nodes-base.hubspot",
      position: [900, 250],
      parameters: {
        resource: "contact",
        operation: "create",
        additionalFields: {
          properties: {
            firstname: "={{$json.contact.first_name}}",
            lastname: "={{$json.contact.last_name}}",
            email: "={{$json.contact.email}}",
            phone: "={{$json.contact.phone}}",
            // Add additional fields as needed
          }
        }
      }
    },
    {
      name: "Update Internal Contact",
      type: "newmindflow-nodes-base.function",
      position: [900, 400],
      parameters: {
        functionCode: `
// This function would update contacts in your internal database
// In reality, you might use another newmindflow node like a database connector
const contact = $input.first().json.contact;

// Process the HubSpot contact into internal format
const internalFormat = {
  first_name: contact.properties.firstname,
  last_name: contact.properties.lastname,
  email: contact.properties.email,
  phone: contact.properties.phone,
  hubspot_id: contact.id,
  updated_at: new Date().toISOString()
};

// In a real implementation, you would update your database
// For this example, we just return what would be updated
return [{
  json: {
    action: "updated_internal_contact",
    contact: internalFormat
  }
}];
`
      }
    },
    {
      name: "Create Internal Contact",
      type: "newmindflow-nodes-base.function",
      position: [900, 550],
      parameters: {
        functionCode: `
// This function would create new contacts in your internal database
// In reality, you might use another newmindflow node like a database connector
const contact = $input.first().json.contact;

// Process the HubSpot contact into internal format
const internalFormat = {
  first_name: contact.properties.firstname,
  last_name: contact.properties.lastname,
  email: contact.properties.email,
  phone: contact.properties.phone,
  hubspot_id: contact.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// In a real implementation, you would insert into your database
// For this example, we just return what would be created
return [{
  json: {
    action: "created_internal_contact",
    contact: internalFormat
  }
}];
`
      }
    },
    {
      name: "Sync Report",
      type: "newmindflow-nodes-base.function",
      position: [1100, 300],
      parameters: {
        functionCode: `
// Collect all results from previous nodes
const updateHubspot = $input.itemsFrom('Update HubSpot Contact');
const createHubspot = $input.itemsFrom('Create HubSpot Contact');
const updateInternal = $input.itemsFrom('Update Internal Contact');
const createInternal = $input.itemsFrom('Create Internal Contact');

// Generate sync summary
return [{
  json: {
    summary: "Sync Complete",
    timestamp: new Date().toISOString(),
    stats: {
      hubspot_updated: updateHubspot.length,
      hubspot_created: createHubspot.length,
      internal_updated: updateInternal.length,
      internal_created: createInternal.length,
      total_changes: updateHubspot.length + createHubspot.length + 
                    updateInternal.length + createInternal.length
    }
  }
}];
`
      }
    }
  ],
  connections: {
    "Schedule Trigger": {
      main: [
        [
          {
            node: "Get HubSpot Contacts",
            type: "main",
            index: 0
          },
          {
            node: "Get newmindflow Contacts",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get HubSpot Contacts": {
      main: [
        [
          {
            node: "Compare & Identify Changes",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Get newmindflow Contacts": {
      main: [
        [
          {
            node: "Compare & Identify Changes",
            type: "main",
            index: 1
          }
        ]
      ]
    },
    "Compare & Identify Changes": {
      main: [
        [
          {
            node: "Route Updates",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Route Updates": {
      main: [
        [
          {
            node: "Update HubSpot Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Create HubSpot Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Update Internal Contact",
            type: "main",
            index: 0
          }
        ],
        [
          {
            node: "Create Internal Contact",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Update HubSpot Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Create HubSpot Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Update Internal Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Create Internal Contact": {
      main: [
        [
          {
            node: "Sync Report",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

return `
# HubSpot Two-Way Sync Workflow Created

I've created a new workflow that will synchronize contacts between HubSpot and your internal system.

**Workflow ID:** ${syncWorkflow.id}

## Configuration Needed:
1. The workflow is currently **inactive** - activate it once configured
2. ${credentialsMessage}
3. You'll need to customize the "Get newmindflow Contacts", "Update Internal Contact", and "Create Internal Contact" nodes to work with your specific database or storage system

## How It Works:
- Runs every 2 hours (configurable)
- Retrieves contacts from both HubSpot and your internal system
- Compares the data to identify new or updated contacts in either system
- Creates or updates contacts to keep both systems in sync
- Generates a sync report with statistics

## Customization:
You may need to modify the field mappings in the function nodes to match your specific data structure
and add any additional fields that need to be synchronized between the systems.
`;
```

### Slack Integration

#### Example: Creating a Workflow to Send newmindflow Notifications to Slack

```javascript
// User request: "Create a workflow that sends newmindflow execution notifications to Slack"

// Create the notification workflow
const notificationWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "newmindflow Execution Notifications to Slack",
  active: false,
  nodes: [
    {
      name: "Webhook",
      type: "newmindflow-nodes-base.webhook",
      position: [100, 300],
      parameters: {
        path: "newmindflow-notification",
        responseMode: "onReceived",
        options: {
          responseData: "noData"
        }
      }
    },
    {
      name: "Format Slack Message",
      type: "newmindflow-nodes-base.function",
      position: [300, 300],
      parameters: {
        functionCode: `
// Parse webhook data from newmindflow
const data = $input.first().json;
const workflow = data.workflow;
const execution = data.execution;

// Determine status color
let color = "#36a64f"; // Green for success
let icon = "✅";

if (execution.status === "error") {
  color = "#ff0000"; // Red for error
  icon = "❌";
} else if (execution.status === "warning") {
  color = "#ffcc00"; // Yellow for warning
  icon = "⚠️";
}

// Create Slack message blocks
const blocks = [
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": \`\${icon} Workflow \${execution.status === "success" ? "Succeeded" : "Failed"}: \${workflow.name}\`,
      "emoji": true
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": \`*Status:*\\n\${execution.status}\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Execution Time:*\\n\${new Date(execution.startedAt).toLocaleString()}\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Duration:*\\n\${Math.round((new Date(execution.finishedAt) - new Date(execution.startedAt)) / 1000)} seconds\`
      },
      {
        "type": "mrkdwn",
        "text": \`*Mode:*\\n\${execution.mode}\`
      }
    ]
  }
];

// Add error details if present
if (execution.status === "error" && execution.error) {
  blocks.push(
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Error Details:*"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": \`\\\`\\\`\${execution.error.message || "Unknown error"}\\\`\\\`\`
      }
    }
  );
}

// Add link to newmindflow execution
blocks.push(
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": \`<\${data.newmindflowUrl}/workflow/\${workflow.id}|View Workflow> | <\${data.newmindflowUrl}/execution/\${execution.id}|View Execution>\`
    }
  }
);

return [{
  json: {
    blocks: blocks,
    text: \`\${icon} Workflow \${execution.status === "success" ? "Succeeded" : "Failed"}: \${workflow.name}\`,
    channel: "#newmindflow-notifications"
  }
}];
`
      }
    },
    {
      name: "Send to Slack",
      type: "newmindflow-nodes-base.slack",
      position: [500, 300],
      parameters: {
        token: "{{$env.SLACK_TOKEN}}",
        text: "={{$json.text}}",
        channel: "={{$json.channel}}",
        otherOptions: {
          blocks: "={{$json.blocks}}"
        }
      }
    }
  ],
  connections: {
    "Webhook": {
      main: [
        [
          {
            node: "Format Slack Message",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Format Slack Message": {
      main: [
        [
          {
            node: "Send to Slack",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

// Create workflow to set up webhook in newmindflow settings
const setupWorkflow = await useMcpTool('newmindflow-mcp-server', 'workflow_create', {
  name: "Configure newmindflow Execution Notifications",
  active: false,
  nodes: [
    {
      name: "Manual Trigger",
      type: "newmindflow-nodes-base.manualTrigger",
      position: [100, 300],
      parameters: {}
    },
    {
      name: "newmindflow Settings",
      type: "newmindflow-nodes-base.newmindflow",
      position: [300, 300],
      parameters: {
        resource: "settings",
        operation: "update",
        values: {
          executionTimeout: 120,
          saveManualExecutions: true,
          saveDataErrorExecution: "all", 
          saveDataSuccessExecution: "all",
          saveExecutionProgress: true,
          executeTimeout: 120,
          maxExecutionTimeout: 300,
          workflowCallerIdsAllowed: [],
          timezone: "UTC",
          executionMode: "regular",
          pushBackend: "websocket",
          webhookDebugEnabled: false,
          webhookUrl: "={{$json.webhookUrl}}",
          logLevel: "info"
        }
      }
    },
    {
      name: "Create Instructions",
      type: "newmindflow-nodes-base.function",
      position: [500, 300],
      parameters: {
        functionCode: `
const webhookNode = $input.itemsFrom('Webhook')? $input.itemsFrom('Webhook')[0] : { json: { webhookUrl: "unknown" } };
const webhookUrl = webhookNode.json.webhookUrl;

return [{
  json: {
    instructions: \`
# newmindflow to Slack Notification Setup

I've created two workflows:

1. **newmindflow Execution Notifications to Slack** - This workflow receives execution notifications from newmindflow and sends them to Slack
   - ID: ${notificationWorkflow.id}
   - Webhook URL: \${webhookUrl}

2. **Configure newmindflow Execution Notifications** - This workflow configures newmindflow settings to send notifications
   - ID: ${setupWorkflow.id}

## Next Steps:

1. Create a Slack app and obtain a token with the following permissions:
   - chat:write
   - chat:write.public
   
2. Set the environment variable \`SLACK_TOKEN\` with your Slack token

3. Run the "Configure newmindflow Execution Notifications" workflow after setting the \`webhookUrl\` parameter to:
   \${webhookUrl}

4. Activate the "newmindflow Execution Notifications to Slack" workflow

5. Customize the channel in the "Format Slack Message" node if needed (default is #newmindflow-notifications)

Once completed, you'll receive Slack notifications whenever a workflow execution succeeds or fails!
\`
  }
}];
`
      }
    }
  ],
  connections: {
    "Manual Trigger": {
      main: [
        [
          {
            node: "newmindflow Settings",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "newmindflow Settings": {
      main: [
        [
          {
            node: "Create Instructions",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
});

// Execute the workflow to get the webhook URL
const execution = await useMcpTool('newmindflow-mcp-server', 'execution_run', {
  workflowId: notificationWorkflow.id,
  waitForCompletion: true
});

// Extract webhook URL from the execution
let webhookUrl = "undefined";
if (execution.status === "success" && execution.data?.resultData?.runData?.Webhook?.[0]?.data?.webhookUrl) {
  webhookUrl = execution.data.resultData.runData.Webhook[0].data.webhookUrl;
}

return `
# newmindflow to Slack Notification Setup

I've created two workflows:

1. **newmindflow Execution Notifications to Slack** - This workflow receives execution notifications from newmindflow and sends them to Slack
   - ID: ${notificationWorkflow.id}
   - Webhook URL: ${webhookUrl}

2. **Configure newmindflow Execution Notifications** - This workflow configures newmindflow settings to send notifications
   - ID: ${setupWorkflow.id}

## Next Steps:

1. Create a Slack app and obtain a token with the following permissions:
   - chat:write
   - chat:write.public
   
2. Set the environment variable \`SLACK_TOKEN\` with your Slack token

3. Run the "Configure newmindflow Execution Notifications" workflow after setting the \`webhookUrl\` parameter to:
   ${webhookUrl}

4. Activate the "newmindflow Execution Notifications to Slack" workflow

5. Customize the channel in the "Format Slack Message" node if needed (default is #newmindflow-notifications)

Once completed, you
