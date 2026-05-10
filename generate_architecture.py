import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Initialize figure
fig, ax = plt.subplots(figsize=(16, 10))
ax.set_xlim(0, 16)
ax.set_ylim(0, 10)
ax.axis('off')

# Helper function to draw boxes
def draw_box(ax, x, y, width, height, title, subtitle="", color='#E1F5FE', edge_color='#0288D1'):
    box = patches.FancyBboxPatch((x, y), width, height, boxstyle="round,pad=0.1", 
                                 ec=edge_color, fc=color, lw=2)
    ax.add_patch(box)
    
    text_y = y + height - 0.4
    ax.text(x + width/2, text_y, title, ha='center', va='center', 
            fontsize=11, fontweight='bold', color='#333333')
    
    if subtitle:
        ax.text(x + width/2, text_y - 0.4, subtitle, ha='center', va='center', 
                fontsize=9, color='#555555')
    return box

# Outer Containers
# Frontend
draw_box(ax, 0.5, 6.5, 3.5, 2.5, "Frontend Container", "(React.js + Nginx)\nPort: 80", 
         color='#E8F5E9', edge_color='#2E7D32')

# Backend
draw_box(ax, 5.5, 4.5, 5.5, 4.5, "Backend Container", "(FastAPI)\nPort: 8000", 
         color='#FFF3E0', edge_color='#E65100')

# Backend Internals
draw_box(ax, 6.0, 7.5, 4.5, 1.0, "API Layer", "(Endpoints: /stream/upload,\n/stream/live, /roi/data)", 
         color='#FFE0B2', edge_color='#EF6C00')
draw_box(ax, 6.0, 6.0, 4.5, 1.0, "Face Detection Engine", "(MediaPipe + PIL Bounding Boxes)", 
         color='#FFE0B2', edge_color='#EF6C00')
draw_box(ax, 6.0, 4.7, 4.5, 0.8, "DB Writer", "", 
         color='#FFE0B2', edge_color='#EF6C00')

# Redis
draw_box(ax, 0.5, 3.5, 3.5, 2.0, "Redis Container", "(Frame Queue Buffering)\nPort: 6379", 
         color='#FFEBEE', edge_color='#C62828')

# PostgreSQL
draw_box(ax, 5.5, 1.0, 5.5, 2.0, "PostgreSQL Container", "(ROI Database)\nPort: 5432", 
         color='#E3F2FD', edge_color='#1565C0')

# Arrows Helper
def draw_arrow(ax, start, end, label, color='black', rad=0, text_offset=(0,0)):
    arrow = patches.FancyArrowPatch(start, end, connectionstyle=f"arc3,rad={rad}", 
                                    arrowstyle="->,head_width=5,head_length=8", 
                                    color=color, lw=2, mutation_scale=2)
    ax.add_patch(arrow)
    
    # Calculate text position
    if rad == 0:
        mid_x = (start[0] + end[0]) / 2
        mid_y = (start[1] + end[1]) / 2
    else:
        # Approximate curve midpoint
        mid_x = (start[0] + end[0]) / 2
        mid_y = (start[1] + end[1]) / 2 + rad * 1.5

    ax.text(mid_x + text_offset[0], mid_y + text_offset[1], label, ha='center', va='center', 
            fontsize=9, fontweight='bold', color=color, 
            bbox=dict(facecolor='white', edgecolor='none', alpha=0.9, pad=1))

# Frontend <-> API Layer
draw_arrow(ax, (4.0, 8.2), (6.0, 8.2), "WebSocket\n(Real-time Frame Stream)", color='#2E7D32')
draw_arrow(ax, (4.0, 7.8), (6.0, 7.8), "HTTP\n(POST /stream/upload, GET /roi/data)", color='#1565C0')

# API Layer -> Redis
draw_arrow(ax, (6.0, 7.7), (4.0, 5.0), "Push Frames", color='#C62828', rad=0.2, text_offset=(-0.3, -0.6))

# Redis -> Face Detection
draw_arrow(ax, (4.0, 4.5), (6.0, 6.5), "Pop Frames\n(Queue)", color='#C62828', rad=0.2, text_offset=(0.3, -0.8))

# Face Detection -> DB Writer
draw_arrow(ax, (8.25, 6.0), (8.25, 5.5), "Internal", color='#555555')

# DB Writer -> PostgreSQL
draw_arrow(ax, (8.25, 4.7), (8.25, 3.0), "SQL (Writes)\nframe_id, x, y, w, h, conf, ts", color='#1565C0')

# API Layer -> PostgreSQL
draw_arrow(ax, (10.0, 7.5), (10.0, 3.0), "SQL (Reads)", color='#1565C0', rad=-0.2, text_offset=(1.0, 0))

# Legend
legend_box = patches.FancyBboxPatch((11.5, 6.5), 3.5, 2.5, boxstyle="round,pad=0.1", ec='#999999', fc='#F5F5F5', lw=1)
ax.add_patch(legend_box)
ax.text(13.25, 8.7, "Legend", ha='center', va='center', fontsize=12, fontweight='bold')

def add_legend_item(ax, x, y, text, color):
    ax.plot([x, x + 0.5], [y, y], color=color, lw=2.5)
    ax.text(x + 0.7, y, text, va='center', fontsize=10)

add_legend_item(ax, 11.7, 8.2, "WebSocket (Real-Time)", '#2E7D32')
add_legend_item(ax, 11.7, 7.7, "HTTP Requests", '#1565C0')
add_legend_item(ax, 11.7, 7.2, "Redis Pub/Sub / Queue", '#C62828')
add_legend_item(ax, 11.7, 6.7, "SQL Database I/O", '#1565C0')

# Title
plt.text(8.0, 9.5, "Real-Time Face Detection Video Streaming Architecture", 
         ha='center', va='center', fontsize=16, fontweight='bold')

plt.savefig('architecture.png', dpi=300, bbox_inches='tight')
print("Architecture diagram saved as architecture.png")
