import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingScreen from "../../components/LoadingScreen";

const CrudViewPage = ({ title, fetcher, sections = [], actions }) => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!fetcher) return;
      setLoading(true);
      try {
        const response = await fetcher(id);
        setRecord(response);
      } catch (error) {
        console.error("Unable to fetch record", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher, id]);

  if (loading || !record) {
    return <LoadingScreen label="Loading details..." />;
  }

  return (
    <div>
      <PageHeader title={title} actions={actions?.(record)} />
      <div className="row g-3">
        {sections.map((section) => (
          <div key={section.title} className={section.col || "col-lg-6"}>
            <div className="table-card h-100">
              <h6 className="mb-3">{section.title}</h6>
              <div className="row">
                {section.fields.map((field) => (
                  <div key={field.label} className="col-12 mb-3">
                    <div className="text-muted small">{field.label}</div>
                    <div className="fw-semibold">
                      {field.render
                        ? field.render(record[field.key], record)
                        : record[field.key] || "NA"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrudViewPage;

