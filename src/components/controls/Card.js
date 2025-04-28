import React, { useState } from "react";
import CardText from "./atoms/Text";
import CardTime from "./atoms/Time";
import CardButton from "./atoms/Button";
import CardCaret from "./atoms/Caret";
import CardCustom from "./atoms/CustomField";
import CardMedia from "./atoms/Media";

import { makeNiceDate, isEmptyString } from "../../common/utilities";
import hash from "object-hash";

export const generateCardLayout = {
  basic: ({ event }) => {
    return [
      [
        {
          kind: "date",
          title: "Fecha incidente",
          value: event.datetime || event.date || ``,
        },
        {
          kind: "text",
          title: "Ubicación",
          value: event.location || `—`,
        },
      ],
      [{ kind: "line-break", times: 0.4 }],
      [
        {
          kind: "text",
          title: "Resumen",
          value: event.description || ``,
          scaleFont: 1.1,
        },
      ],
    ];
  },
  sourced: ({ event }) => {
    return [
      [
        {
          kind: "date",
          title: "Fecha incidente",
          value: event.datetime || event.date || ``,
        },
        {
          kind: "text",
          title: "Ubicación",
          value: event.location || `—`,
        },
      ],
      [
        {
          kind: "text",
          title: "Resumen",
          value: event.description || ``,
          scaleFont: 1.1,
        },
      ],
    ];
  },
};

export const Card = ({
  content = [],
  isLoading = true,
  onSelect = () => {},
  sources = [],
  isSelected = false,
  language = "es-MX",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  // NB: should be internationalized.
  const renderTime = (field) => (
    <CardTime
      language={language}
      timelabel={makeNiceDate(field.value)}
      {...field}
    />
  );

  const renderCaret = () => (
    <CardCaret toggle={() => toggle()} isOpen={isOpen} />
  );

  const renderMedia = ({ media, idx }) => {
    return <CardMedia key={idx} src={media.src} title={media.title} />;
  };

  function renderField(field) {
    switch (field.kind) {
      case "media":
        return (
          <div className="card-cell">
            {field.value.map((media, idx) => {
              return renderMedia({ media, idx });
            })}
          </div>
        );
      case "line":
        return (
          <div style={{ height: `1rem`, width: `100%` }}>
            <hr />
          </div>
        );
      case "line-break":
        return (
          <div style={{ height: `${field.times || 1}rem`, width: `100%` }} />
        );
      case "item":
        // this is like a span
        return null;
      case "markdown":
        return <CardCustom {...field} />;
      case "tag":
        return (
          <div
            className="card-cell m0"
            style={{
              textTransform: `uppercase`,
              fontSize: `.8em`,
              lineHeight: `.8em`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: `flex-${field.align || `start`}`,
              }}
            >
              {field.value}
            </div>
          </div>
        );
      case "button":
        return (
          <div className="card-cell">
            {field.title && <h4>{field.title}</h4>}
            {/* <div className="card-row"> */}
            {field.value.map((t, idx) => (
              <CardButton key={`card-button-${idx}`} {...t} />
            ))}
            {/* </div> */}
          </div>
        );
      case "text":
        return !isEmptyString(field.value) && <CardText {...field} />;
      case "date":
        return renderTime(field);
      case "links":
        return (
          <div className="card-cell">
            {field.title && <h4>{field.title}</h4>}
            <div className="card-row m0">
              {field.value.map(({ text, href }, idx) => (
                <a href={href} key={`card-links-url-${idx}`}>
                  {text}
                </a>
              ))}
            </div>
          </div>
        );
      case "list":
        // Only render if some of the list's strings are non-empty
        const shouldFieldRender =
          !!field.value.length &&
          !!field.value.filter((s) => !isEmptyString(s)).length;
        return shouldFieldRender ? (
          // <div className="card-cell">
          <div>
            {field.title && <h4>{field.title}</h4>}
            <div className="card-row m0">
              {field.value.map((t, idx) => (
                <CardText key={`card-list-text-${idx}`} value={t} {...t} />
              ))}
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  }

  function renderRow(row) {
    return (
      <div className="card-row" key={hash(row)}>
        {row.map((field) => (
          <span key={hash(field)}>{renderField(field)}</span>
        ))}
      </div>
    );
  }

  function renderSourceContent(source) {
    return (
      <div className="card-row source-content" key={`source-${source.id}`}>
        {source.title && (
          <div className="card-cell">
            <h4>{source.title}</h4>
            {source.description && <p>{source.description}</p>}
          </div>
        )}
        {source.paths && source.paths.length > 0 && (
          <div className="card-cell">
            {source.paths.map((path, idx) => (
              <CardMedia
                key={`source-media-${idx}`}
                src={path}
                title={`${source.type || "Media"} ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <li
      key={hash(content)}
      className={`event-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      {content.map((row) => renderRow(row))}
      {isOpen && (
        <div className="card-bottomhalf">
          <div className="card-row">
            <h4
              style={{
                width: "100%",
                borderBottom: "1px solid #ddd",
                paddingBottom: "5px",
              }}
            >
              Fuentes
            </h4>
          </div>
          {sources.length > 0 ? (
            sources.map((source) => renderSourceContent(source))
          ) : (
            <div className="card-row">
              <div className="card-cell">
                <p>No hay fuentes disponibles para este evento.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {sources.length > 0 && renderCaret()}
    </li>
  );
};
