```mermaid
graph TD
    %% Main Components
    Editor[Editor Component] --> Map[Map Component]
    Editor --> Canvas[Canvas Manager]
    Editor --> Toolbar[Toolbar]
    Editor --> Sidebar[Sidebar]
    Editor --> TitleBlock[Title Block]
    Editor --> NotesPanel[Notes Panel]
    Editor --> ContextMenu[Context Menu]

    %% Map & Canvas Systems
    Map --> MapboxGL[Mapbox GL]
    Canvas --> RenderManager[Render Manager]
    Canvas --> ToolManager[Tool Manager]

    %% Tool System
    ToolManager --> BaseTool[Base Tool]
    BaseTool --> SelectTool[Select Tool]
    BaseTool --> LineTool[Line Tool]
    BaseTool --> ArrowTool[Arrow Tool]
    BaseTool --> RectTool[Rectangle Tool]
    BaseTool --> PolygonTool[Polygon Tool]
    BaseTool --> TextTool[Text Tool]
    BaseTool --> SignTool[Sign Tool]
    BaseTool --> DimensionTool[Dimension Tool]

    %% Event System
    EventManager[Event Manager] --> Editor
    EventManager --> Canvas
    EventManager --> ToolManager

    %% Project System
    ProjectSave[Project Save/Load] --> Editor
    ProjectSave --> Supabase[Supabase DB]

    %% State Management
    Editor --> State[State Management]
    State --> DrawnLines[Drawn Lines]
    State --> ViewState[View State]
    State --> TitleData[Title Block Data]
    State --> ProjectData[Project Data]

    %% Styling
    style Editor fill:#f9f,stroke:#333,stroke-width:2px
    style EventManager fill:#ff9,stroke:#333,stroke-width:2px
    style ToolManager fill:#9f9,stroke:#333,stroke-width:2px
    style BaseTool fill:#9f9,stroke:#333,stroke-width:2px
    style Canvas fill:#99f,stroke:#333,stroke-width:2px
    style Map fill:#99f,stroke:#333,stroke-width:2px

    ```