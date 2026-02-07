import streamlit as st
import google.generativeai as genai
import pandas as pd
import plotly.express as px
import folium
from streamlit_folium import st_folium
from datetime import datetime
import time
import os

# --- CONFIGURATION ---
st.set_page_config(
    page_title="FixMyCity | AI Smart Civic Platform",
    page_icon="🏙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CUSTOM CSS (To mimic the Glassmorphism/Dark Theme) ---
st.markdown("""
<style>
    .stApp {
        background-color: #02040A;
        background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                          radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%);
    }
    .stMetric {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    div[data-testid="stSidebar"] {
        background-color: rgba(11, 15, 25, 0.8);
        backdrop-filter: blur(10px);
    }
</style>
""", unsafe_allow_html=True)

# --- TYPES & MOCK DATA ---
SOLAPUR_COORDS = [17.6599, 75.9064]

if 'users' not in st.session_state:
    st.session_state.users = [
        {'email': 'rahul@solapur.in', 'password': '123', 'name': 'Rahul Sharma', 'role': 'CITIZEN', 'avatar': '👤'},
        {'email': 'admin@solapur.gov', 'password': 'admin', 'name': 'Inspector Kulkarni', 'role': 'AUTHORITY', 'avatar': '👮'}
    ]

if 'issues' not in st.session_state:
    st.session_state.issues = [
        {
            'id': 1, 'title': 'Severe Pothole', 'category': 'ROAD', 'lat': 17.6715, 'lng': 75.9100, 
            'status': 'OPEN', 'description': 'Deep pothole near temple.', 'severity': 8,
            'image': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'
        },
        {
            'id': 2, 'title': 'Garbage Overflow', 'category': 'GARBAGE', 'lat': 17.6780, 'lng': 75.9080, 
            'status': 'ASSIGNED', 'description': 'Bins overflowing in market.', 'severity': 4,
            'image': 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800'
        },
        {
            'id': 3, 'title': 'Streetlight Broken', 'category': 'LIGHTS', 'lat': 17.6880, 'lng': 75.9150, 
            'status': 'RESOLVED', 'description': 'Dark road section.', 'severity': 6,
            'image': 'https://images.unsplash.com/photo-1618423719018-77292215c2d3?w=800'
        }
    ]

if 'current_user' not in st.session_state:
    st.session_state.current_user = None

if 'messages' not in st.session_state:
    st.session_state.messages = []

# --- GEMINI AI SERVICE ---
def init_gemini(api_key):
    if api_key:
        genai.configure(api_key=api_key)
        return True
    return False

def analyze_image_with_ai(image_data):
    # Simulation if no API key
    if not st.session_state.get('api_key'):
        time.sleep(2)
        return {
            "type": "Road Damage (Simulated)",
            "severity": 7,
            "description": "Detected cracks in asphalt. Simulated AI response.",
            "priority": 75
        }
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([
            "Analyze this road image for civic issues. Return JSON with type, severity (1-10), description, and priority (1-100).",
            image_data
        ])
        return response.text # In real app, parse JSON here
    except Exception as e:
        return {"error": str(e)}

# --- COMPONENT: AUTHENTICATION ---
def login_page():
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.title("🏙️ FixMyCity")
        st.subheader("AI Smart Civic Platform")
        
        tab1, tab2 = st.tabs(["Login", "Register"])
        
        with tab1:
            email = st.text_input("Email", placeholder="rahul@solapur.in")
            password = st.text_input("Password", type="password", placeholder="123")
            
            if st.button("Secure Login", use_container_width=True):
                user = next((u for u in st.session_state.users if u['email'] == email and u['password'] == password), None)
                if user:
                    st.session_state.current_user = user
                    st.success(f"Welcome back, {user['name']}!")
                    st.rerun()
                else:
                    st.error("Invalid credentials")
                    
        with tab2:
            new_name = st.text_input("Full Name")
            new_email = st.text_input("New Email")
            new_pass = st.text_input("New Password", type="password")
            role = st.selectbox("Role", ["CITIZEN", "AUTHORITY"])
            
            if st.button("Create Account", use_container_width=True):
                st.session_state.users.append({
                    'email': new_email, 'password': new_pass, 'name': new_name, 'role': role, 'avatar': '👤'
                })
                st.success("Account created! Please login.")

# --- COMPONENT: SIDEBAR ---
def render_sidebar():
    with st.sidebar:
        user = st.session_state.current_user
        st.header(f"{user['avatar']} {user['name']}")
        st.caption(f"{user['role']} | Solapur Region")
        st.divider()
        
        menu_options = [
            "Dashboard", "Map Interface", "Report Issue", 
            "AI Assistant", "Live Report", "Settings"
        ]
        
        selected = st.radio("Navigation", menu_options)
        
        st.divider()
        # API Key input for functionality
        api_key = st.text_input("Gemini API Key", type="password")
        if api_key:
            st.session_state.api_key = api_key
            
        if st.button("Logout", type="primary"):
            st.session_state.current_user = None
            st.rerun()
            
        return selected

# --- VIEW: DASHBOARD ---
def view_dashboard():
    st.title("Command Center")
    
    # Metrics
    c1, c2, c3, c4 = st.columns(4)
    df = pd.DataFrame(st.session_state.issues)
    
    c1.metric("Active Issues", len(df[df['status'] != 'RESOLVED']), "+2 today")
    c2.metric("Resolved", len(df[df['status'] == 'RESOLVED']), "+5 this week")
    c3.metric("Avg Severity", f"{df['severity'].mean():.1f}/10", "-0.2")
    c4.metric("Civic Score", "840", "Gold Tier")
    
    col_chart, col_feed = st.columns([2, 1])
    
    with col_chart:
        st.subheader("Issue Analytics")
        if not df.empty:
            chart_data = df['category'].value_counts().reset_index()
            fig = px.bar(chart_data, x='category', y='count', color='category', 
                         title="Issues by Category", template="plotly_dark")
            st.plotly_chart(fig, use_container_width=True)
            
    with col_feed:
        st.subheader("City Feed")
        for issue in st.session_state.issues:
            with st.container():
                st.markdown(f"""
                <div style="padding:10px; border:1px solid #333; border-radius:10px; margin-bottom:10px;">
                    <small style="color: #0ea5e9">@{issue['category']}</small>
                    <h4 style="margin:0">{issue['title']}</h4>
                    <p style="font-size:12px; color:#aaa">{issue['description']}</p>
                    <div style="display:flex; justify-content:space-between;">
                         <span style="color:{'#ef4444' if issue['status']=='OPEN' else '#10b981'}">● {issue['status']}</span>
                         <span>Severity: {issue['severity']}</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

# --- VIEW: MAP INTERFACE ---
def view_map():
    st.title("📍 Solapur City Grid")
    
    m = folium.Map(location=SOLAPUR_COORDS, zoom_start=13, tiles="CartoDB dark_matter")
    
    for issue in st.session_state.issues:
        color = 'red' if issue['status'] == 'OPEN' else 'green'
        folium.Marker(
            [issue['lat'], issue['lng']],
            popup=issue['title'],
            tooltip=issue['category'],
            icon=folium.Icon(color=color, icon="info-sign")
        ).add_to(m)
        
    st_folium(m, width="100%", height=600)

# --- VIEW: REPORT ISSUE ---
def view_report():
    st.title("📸 AI Report Issue")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.info("Upload a photo or use camera to auto-detect issues.")
        img_file = st.camera_input("Capture Issue")
        uploaded_file = st.file_uploader("Or Upload Image", type=['jpg', 'png'])
        
        final_image = img_file if img_file else uploaded_file
        
    with col2:
        if final_image:
            with st.spinner("🤖 AI Analyzing damage pattern..."):
                # Call AI Function here
                analysis = analyze_image_with_ai(final_image)
                
                st.success("Analysis Complete")
                
                # Form pre-filled by AI
                with st.form("report_form"):
                    title = st.text_input("Title", value="Detected Pothole" if "Pothole" in str(analysis) else "New Issue")
                    cat = st.selectbox("Category", ["ROAD", "GARBAGE", "WATER", "LIGHTS"])
                    desc = st.text_area("Description", value="AI Detected high severity road damage.")
                    
                    if st.form_submit_button("Submit Report"):
                        new_id = len(st.session_state.issues) + 1
                        st.session_state.issues.insert(0, {
                            'id': new_id, 'title': title, 'category': cat,
                            'lat': SOLAPUR_COORDS[0] + 0.001, 'lng': SOLAPUR_COORDS[1] + 0.001,
                            'status': 'OPEN', 'description': desc, 'severity': 7,
                            'image': ''
                        })
                        st.balloons()
                        st.success("Report lodged to Municipal Authority!")

# --- VIEW: AI CHAT ---
def view_ai_chat():
    st.title("🤖 Civic Assistant")
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat input
    if prompt := st.chat_input("Ask about Solapur services, report status, or general info..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            if st.session_state.get('api_key'):
                try:
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    response = model.generate_content(prompt)
                    bot_reply = response.text
                except:
                    bot_reply = "Error connecting to AI Grid."
            else:
                bot_reply = f"I am operating in Simulation Mode. I received: '{prompt}'. Please provide an API key for full intelligence."
            
            st.markdown(bot_reply)
            st.session_state.messages.append({"role": "assistant", "content": bot_reply})

# --- VIEW: LIVE REPORT ---
def view_live_report():
    st.title("📡 Live Video Uplink")
    st.warning("WebRTC Streaming requires 'streamlit-webrtc'. Utilizing simplified frame capture.")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.image("https://media.istockphoto.com/id/1346563635/video/drone-hyperlapse-of-traffic-moving-on-the-road-at-night.jpg?s=640x640&k=20&c=X7vK3O0JqO4bYj_HhT5yE_uXkZqWq5wzJ_j_j_j_j_j", 
                 caption="Simulated Live Feed: Solapur Market", use_column_width=True)
    
    with col2:
        st.markdown("### AI Analysis Log")
        st.code("""
        [10:42:01] Connection Established
        [10:42:03] Object: Car (Moving)
        [10:42:05] Alert: Pothole detected (Sector 4)
        [10:42:06] Severity: High
        [10:42:10] Logging location...
        """)
        st.button("Stop Stream", type="primary")

# --- MAIN APP LOGIC ---
def main():
    if not st.session_state.current_user:
        login_page()
    else:
        selected_view = render_sidebar()
        
        if selected_view == "Dashboard":
            view_dashboard()
        elif selected_view == "Map Interface":
            view_map()
        elif selected_view == "Report Issue":
            view_report()
        elif selected_view == "AI Assistant":
            view_ai_chat()
        elif selected_view == "Live Report":
            view_live_report()
        elif selected_view == "Settings":
            st.title("⚙️ Settings")
            st.write("Language: English")
            st.write("Theme: Dark (Active)")
            st.write("Notifications: Enabled")

if __name__ == "__main__":
    main()