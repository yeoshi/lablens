/**
 * Wikimedia Commons — Human body silhouette.svg
 * https://commons.wikimedia.org/wiki/File:Human_body_silhouette.svg
 */
import {
  HUMAN_BODY_LAYER_TRANSFORM,
  HUMAN_BODY_PATH,
  HUMAN_BODY_VIEWBOX_HEIGHT,
  HUMAN_BODY_VIEWBOX_WIDTH,
  getSilhouetteDimensions,
  SILHOUETTE_MAX_WIDTH,
} from '../assets/human-body-silhouette-path';

export { getSilhouetteDimensions, SILHOUETTE_MAX_WIDTH };

interface HumanBodySilhouetteProps {
  maxWidth?: number;
  className?: string;
}

export function HumanBodySilhouette({
  maxWidth = SILHOUETTE_MAX_WIDTH,
  className = 'block',
}: HumanBodySilhouetteProps) {
  const { width, height } = getSilhouetteDimensions(maxWidth);

  return (
    <svg
      viewBox={`0 0 ${HUMAN_BODY_VIEWBOX_WIDTH} ${HUMAN_BODY_VIEWBOX_HEIGHT}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={HUMAN_BODY_LAYER_TRANSFORM}>
        <path
          d={HUMAN_BODY_PATH}
          fill="#DBEAFE"
          stroke="#93C5FD"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
