/**
 * Propriétés du composant SystemStats.
 * @interface Props
 * @property {string} title - Le titre de la statistique (ex: "FPS", "Latence").
 * @property {string} value - La valeur formatée de la statistique à afficher.
 */
interface Props {
  title: string;
  value: string;
}

/**
 * Composant simple pour afficher une métrique système sous la forme d'une tuile (panel).
 * Affiche un titre et une valeur mise en évidence.
 */
export const SystemStats = ({ title, value }: Props) => {
  return (
    <div className="panel panel-teal" style={{ flex: 1 }}>
      <div className="panel-title">{title}</div>
      <div style={{ fontSize: '2rem', textAlign: 'center', marginTop: '20px' }}>{value}</div>
    </div>
  );
};
