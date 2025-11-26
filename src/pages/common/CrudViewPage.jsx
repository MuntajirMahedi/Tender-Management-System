import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingScreen from "../../components/LoadingScreen";

const CrudViewPage = ({ title, fetcher, sections = [], actions }) => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetcher(id);
        setRecord(res);
      } catch (err) {
        console.error("Failed to load record:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetcher]);

  if (loading || !record) {
    return <LoadingScreen label="Loading details..." />;
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <PageHeader
        title={title}
        actions={actions ? actions(record) : null}
      />

      {/* MAIN CARD */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          {sections.map((section, index) => (
            <div key={index} className="mb-4 pb-3 border-bottom">
              <h5 className="text-primary mb-3">{section.title}</h5>

              <div className="row g-4">
                {section.fields.map((field, i) => (
                  <div key={i} className="col-md-4 col-sm-6">
                    <div className="text-muted small">{field.label}</div>

                    <div className="fw-semibold mt-1">
                      {field.render
                        ? field.render(record[field.key], record)
                        : record[field.key] || <span className="text-secondary">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default CrudViewPage;
