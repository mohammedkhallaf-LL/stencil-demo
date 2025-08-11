# reusable-grid



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description                                                                                                              | Type          | Default |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------- | ------- |
| `columns`      | `columns`        | An array of column definitions that describe the grid's structure.                                                       | `ColumnDef[]` | `[]`    |
| `currentPage`  | `current-page`   | The current active page. Can be modified by the component's pagination controls.                                         | `number`      | `1`     |
| `data`         | `data`           | An array of data objects to be displayed in the grid. Each object should have keys that match the 'id' in the ColumnDef. | `any[]`       | `[]`    |
| `itemsPerPage` | `items-per-page` | The number of items to display per page.                                                                                 | `number`      | `25`    |
| `totalItems`   | `total-items`    | The total number of items available on the server. Used for pagination.                                                  | `number`      | `0`     |


## Events

| Event         | Description                                                                                                                                                      | Type                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `dataRequest` | Event emitted when data needs to be refetched due to sorting, filtering, or pagination. The parent application should listen for this event to make an API call. | `CustomEvent<DataRequestPayload>` |
| `rowAction`   | Event emitted when a user clicks an action within a row (e.g., 'edit', 'delete').                                                                                | `CustomEvent<ActionEventPayload>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
