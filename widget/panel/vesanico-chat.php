<?php
/**
 * Plugin Name: Radio Vesánico - Voces del Subsuelo
 * Description: Sistema de chat en vivo estilo Post-Punk/Underground con panel flotante y administración.
 * Version: 1.2
 * Author: Tu Nombre
 * Text Domain: vesanico-chat
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

define('VESANICO_VERSION', '1.2.0');
define('VESANICO_TABLE', 'vesanico_comments');

// 1. ACTIVATION: Create Database Table
register_activation_hook(__FILE__, 'vesanico_create_table');
function vesanico_create_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        author tinytext NOT NULL,
        avatar_seed tinytext NOT NULL,
        content text NOT NULL,
        is_admin boolean DEFAULT 0 NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// 2. SETTINGS REGISTRATION
add_action('admin_init', 'vesanico_register_settings');
function vesanico_register_settings() {
    register_setting('vesanico_options_group', 'vesanico_plugin_mode'); // 'chat_only' or 'video_stream'
    register_setting('vesanico_options_group', 'vesanico_stream_url');  // URL for iframe
}

// 3. ENQUEUE SCRIPTS & STYLES
add_action('wp_enqueue_scripts', 'vesanico_enqueue_scripts');
function vesanico_enqueue_scripts() {
    wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', [], '18', true);
    wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', ['react'], '18', true);
    wp_enqueue_script('babel', 'https://unpkg.com/@babel/standalone/babel.min.js', [], '7', true);
    wp_enqueue_style('tailwindcss', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'); 
    wp_enqueue_script('tailwindcss-cdn', 'https://cdn.tailwindcss.com', [], null, false);
    
    wp_enqueue_style('vesanico-style', plugin_dir_url(__FILE__) . 'assets/css/vesanico-style.css', [], VESANICO_VERSION);
    
    wp_register_script('vesanico-app', plugin_dir_url(__FILE__) . 'assets/js/vesanico-app.js', ['jquery', 'react', 'react-dom'], VESANICO_VERSION, true);
    
    // Pass Settings to JS
    wp_localize_script('vesanico-app', 'vesanicoVars', [
        'ajaxUrl'    => admin_url('admin-ajax.php'),
        'nonce'      => wp_create_nonce('vesanico_nonce'),
        'isAdmin'    => current_user_can('moderate_comments'),
        'pluginMode' => get_option('vesanico_plugin_mode', 'chat_only'),
        'streamUrl'  => get_option('vesanico_stream_url', '')
    ]);
    
    wp_enqueue_script('vesanico-app');
}

add_filter('script_loader_tag', 'vesanico_add_type_attribute', 10, 3);
function vesanico_add_type_attribute($tag, $handle, $src) {
    if ('vesanico-app' !== $handle) return $tag;
    return '<script type="text/babel" src="' . esc_url($src) . '"></script>';
}

// 4. FOOTER INJECTION
add_action('wp_footer', 'vesanico_render_root');
function vesanico_render_root() {
    echo '<div id="vesanico-chat-root"></div>';
}

// 5. AJAX HANDLERS
function vesanico_check_permission() {
    $secret = isset($_POST['secret_key']) ? sanitize_text_field($_POST['secret_key']) : '';
    if ($secret === 'Jazz0207') return true;
    if (current_user_can('moderate_comments')) return true;
    return false;
}

add_action('wp_ajax_vesanico_get_comments', 'vesanico_get_comments');
add_action('wp_ajax_nopriv_vesanico_get_comments', 'vesanico_get_comments');
function vesanico_get_comments() {
    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;
    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY time ASC LIMIT 50");
    wp_send_json_success($results);
}

add_action('wp_ajax_vesanico_post_comment', 'vesanico_post_comment');
add_action('wp_ajax_nopriv_vesanico_post_comment', 'vesanico_post_comment');
function vesanico_post_comment() {
    check_ajax_referer('vesanico_nonce', 'nonce');
    $author = sanitize_text_field($_POST['author']);
    $content = sanitize_textarea_field($_POST['content']);
    $isAdmin = ($author === 'Jazz0207' || current_user_can('moderate_comments')) ? 1 : 0;
    
    if (empty($author) || empty($content)) wp_send_json_error('Campos vacíos');

    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;
    $wpdb->insert($table_name, ['time' => current_time('mysql'), 'author' => $author, 'avatar_seed' => $author.time(), 'content' => $content, 'is_admin' => $isAdmin]);
    wp_send_json_success(['id' => $wpdb->insert_id]);
}

add_action('wp_ajax_vesanico_delete_comment', 'vesanico_delete_comment');
add_action('wp_ajax_nopriv_vesanico_delete_comment', 'vesanico_delete_comment');
function vesanico_delete_comment() {
    check_ajax_referer('vesanico_nonce', 'nonce');
    if (!vesanico_check_permission()) wp_send_json_error('No tienes permiso');
    $id = intval($_POST['id']);
    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;
    $wpdb->delete($table_name, ['id' => $id]);
    wp_send_json_success();
}

add_action('wp_ajax_vesanico_update_comment', 'vesanico_update_comment');
add_action('wp_ajax_nopriv_vesanico_update_comment', 'vesanico_update_comment');
function vesanico_update_comment() {
    check_ajax_referer('vesanico_nonce', 'nonce');
    if (!vesanico_check_permission()) wp_send_json_error('No tienes permiso');
    $id = intval($_POST['id']);
    $content = sanitize_textarea_field($_POST['content']);
    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;
    $wpdb->update($table_name, ['content' => $content], ['id' => $id]);
    wp_send_json_success();
}

// 6. ADMIN MENU & DASHBOARD PAGE
add_action('admin_menu', 'vesanico_admin_menu');
function vesanico_admin_menu() {
    add_menu_page('Radio Vesánico', 'Radio Vesánico', 'moderate_comments', 'vesanico-chat', 'vesanico_admin_page', 'dashicons-format-audio', 20);
}

function vesanico_admin_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . VESANICO_TABLE;

    // Actions
    if (isset($_POST['delete_comment']) && check_admin_referer('delete_comment_' . $_POST['comment_id'])) {
        $wpdb->delete($table_name, ['id' => intval($_POST['comment_id'])]);
    }
    if (isset($_POST['nuke_all']) && check_admin_referer('nuke_all_comments')) {
        $wpdb->query("TRUNCATE TABLE $table_name");
    }
    if (isset($_POST['save_edit']) && check_admin_referer('edit_comment_action')) {
        $wpdb->update($table_name, ['content' => sanitize_textarea_field($_POST['new_content'])], ['id' => intval($_POST['edit_id'])]);
    }

    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'general';
    ?>
    <div class="wrap">
        <h1 class="wp-heading-inline">Radio Vesánico - Voces del Subsuelo</h1>
        
        <h2 class="nav-tab-wrapper">
            <a href="?page=vesanico-chat&tab=general" class="nav-tab <?php echo $active_tab == 'general' ? 'nav-tab-active' : ''; ?>">Moderación</a>
            <a href="?page=vesanico-chat&tab=settings" class="nav-tab <?php echo $active_tab == 'settings' ? 'nav-tab-active' : ''; ?>">Configuración Stream</a>
        </h2>

        <?php if ($active_tab == 'settings'): ?>
            <div class="card" style="padding: 20px; margin-top: 20px; background: #222; color: #eee; border-left: 4px solid #ff0055;">
                <form method="post" action="options.php">
                    <?php settings_fields('vesanico_options_group'); ?>
                    <?php do_settings_sections('vesanico_options_group'); ?>
                    
                    <h3>Configuración de Transmisión</h3>
                    <p>Selecciona qué experiencia verán los usuarios en la Home.</p>

                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row" style="color:#ff0055">Modo del Plugin</th>
                            <td>
                                <select name="vesanico_plugin_mode" style="background:#333; color:#fff; border:1px solid #555;">
                                    <option value="chat_only" <?php selected(get_option('vesanico_plugin_mode'), 'chat_only'); ?>>Solo Chat (Panel Flotante)</option>
                                    <option value="video_stream" <?php selected(get_option('vesanico_plugin_mode'), 'video_stream'); ?>>Video Stream + Chat (Modal)</option>
                                </select>
                                <p class="description" style="color:#aaa;">Si seleccionas "Video Stream", aparecerá un botón para abrir el stream de video y el chat pausará automáticamente la radio web.</p>
                            </td>
                        </tr>
                        <tr valign="top">
                            <th scope="row" style="color:#ff0055">URL del Stream (Embed)</th>
                            <td>
                                <input type="text" name="vesanico_stream_url" value="<?php echo esc_attr(get_option('vesanico_stream_url')); ?>" style="width: 100%; background:#333; color:#fff; border:1px solid #555;" placeholder="https://www.youtube.com/embed/..." />
                                <p class="description" style="color:#aaa;">Pega aquí la URL "Embed" de YouTube, Twitch o tu servidor de streaming.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Guardar Configuración', 'primary', 'submit', true, ['style' => 'background: #ff0055; border:none; text-shadow:none;']); ?>
                </form>
            </div>
        <?php else: ?>
            <!-- Moderation UI (Code mostly same as before, simplified for brevity in this block) -->
             <?php 
                $is_editing = isset($_GET['action']) && $_GET['action'] == 'edit'; 
                if(!$is_editing) {
                    echo '<div style="margin-top:20px; background:#111; color:#fff; padding:10px;">Gestiona los comentarios en tiempo real.</div>';
                    // List table logic here (same as previous iteration)
                }
                // ... (Includes the rest of the moderation table code)
                $comments = $wpdb->get_results("SELECT * FROM $table_name ORDER BY time DESC"); 
            ?>
             <?php if ($is_editing && isset($_GET['id'])): 
                    $edit_id = intval($_GET['id']);
                    $edit_data = $wpdb->get_row("SELECT * FROM $table_name WHERE id = $edit_id");
             ?>
                <!-- Edit Form -->
                <div class="card" style="margin-top:20px;">
                    <form method="post" action="<?php echo remove_query_arg(['action', 'id', 'tab']); ?>">
                        <?php wp_nonce_field('edit_comment_action'); ?>
                        <input type="hidden" name="edit_id" value="<?php echo $edit_data->id; ?>">
                        <textarea name="new_content" class="large-text code" rows="5"><?php echo esc_textarea($edit_data->content); ?></textarea>
                        <button type="submit" name="save_edit" class="button button-primary" style="margin-top:10px;">Guardar</button>
                    </form>
                </div>
             <?php else: ?>
                <table class="wp-list-table widefat fixed striped table-view-list posts" style="margin-top:20px;">
                    <thead><tr><th>Fecha</th><th>Autor</th><th>Comentario</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <?php foreach ($comments as $c): ?>
                        <tr>
                            <td><?php echo $c->time; ?></td>
                            <td><?php if($c->is_admin) echo '★ '; echo esc_html($c->author); ?></td>
                            <td><?php echo esc_html($c->content); ?></td>
                            <td>
                                <a href="?page=vesanico-chat&action=edit&id=<?php echo $c->id; ?>" class="button button-small">Editar</a>
                                <form method="post" style="display:inline;"><input type="hidden" name="comment_id" value="<?php echo $c->id; ?>"><?php wp_nonce_field('delete_comment_'.$c->id); ?><input type="submit" name="delete_comment" class="button button-small" value="X"></form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
             <?php endif; ?>
        <?php endif; ?>
    </div>
    <?php
}
