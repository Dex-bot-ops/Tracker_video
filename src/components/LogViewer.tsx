/**
 * Composant permettant d'afficher les journaux (logs) du système.
 * Actuellement, il affiche une zone de texte statique, prévue pour intégrer
 * des flux de logs dynamiques dans le futur.
 */
export const LogViewer = () => {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">Logs Système</div>
      <div
        style={{
          flex: 1,
          backgroundColor: '#f3f4f5',
          border: '1px solid #e5e5e5',
          padding: '1rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#32363a',
          overflowY: 'auto',
          minHeight: '150px',
        }}
      >
        <div style={{ color: '#6a6d70' }}>[INFO] Système initialisé. En attente...</div>
        {/* Les vrais logs arriveront ici plus tard */}
      </div>
    </div>
  );
};
