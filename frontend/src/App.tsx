import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Eye, Trash2 } from 'lucide-react';

const GET_RELEASES = gql`
  query GetReleases {
    releases {
      id
      name
      targetDate
      status
      additionalInfo
      steps
    }
  }
`;

const CREATE_RELEASE = gql`
  mutation CreateRelease($name: String!, $targetDate: DateTime!, $additionalInfo: String) {
    createRelease(name: $name, targetDate: $targetDate, additionalInfo: $additionalInfo) {
      id
      name
      targetDate
      status
      additionalInfo
      steps
    }
  }
`;

const UPDATE_RELEASE = gql`
  mutation UpdateRelease($id: ID!, $name: String, $targetDate: DateTime, $steps: JSON, $additionalInfo: String) {
    updateRelease(id: $id, name: $name, targetDate: $targetDate, steps: $steps, additionalInfo: $additionalInfo) {
      id
      name
      targetDate
      status
      additionalInfo
      steps
    }
  }
`;

const DELETE_RELEASE = gql`
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;

const RELEASE_STEPS = [
  "All relevant GitHub pull requests have been merged",
  "CHANGELOG.md files have been updated",
  "All tests are passing",
  "Releases in GitHub created",
  "Deployed in demo",
  "Tested thoroughly in demo",
  "Deployed in production",
];

const isChecked = (steps: Record<string, boolean>, stepName: string): boolean =>
  steps?.[stepName] ?? false;

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateForInput(dateStr: string) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

export default function App() {
  const { data, loading, error } = useQuery(GET_RELEASES);
  const [createRelease] = useMutation(CREATE_RELEASE, {
    update(cache, { data: { createRelease } }) {
      cache.modify({
        fields: {
          releases(existingReleases = []) {
            const newReleaseRef = cache.writeFragment({
              data: createRelease,
              fragment: gql`
                fragment NewRelease on Release {
                  id
                  type
                }
              `
            });
            return [newReleaseRef, ...existingReleases];
          }
        }
      });
    }
  });
  
  const [updateRelease] = useMutation(UPDATE_RELEASE);
  const [deleteRelease] = useMutation(DELETE_RELEASE, {
    update(cache, { data: { deleteRelease } }) {
      cache.modify({
        fields: {
          releases(existingReleases = [], { readField }) {
            return existingReleases.filter(
              (releaseRef: any) => deleteRelease !== readField('id', releaseRef)
            );
          }
        }
      });
    }
  });

  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal State
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newInfo, setNewInfo] = useState('');

  // Detail State
  const [detailName, setDetailName] = useState('');
  const [detailDate, setDetailDate] = useState('');
  const [detailInfo, setDetailInfo] = useState('');
  const [detailSteps, setDetailSteps] = useState<any>({});

  const handleView = (release: any) => {
    setSelectedRelease(release);
    setDetailName(release.name);
    setDetailDate(formatDateForInput(release.targetDate));
    setDetailInfo(release.additionalInfo || '');
    setDetailSteps(release.steps || {});
  };

  const handleSaveDetail = async () => {
    if (!selectedRelease) return;
    await updateRelease({
      variables: {
        id: selectedRelease.id,
        name: detailName,
        targetDate: new Date(detailDate).toISOString(),
        steps: detailSteps,
        additionalInfo: detailInfo
      }
    });
    setSelectedRelease(null); // Return to list after saving
  };

  const handleCreate = async () => {
    if (!newName || !newDate) return;
    await createRelease({
      variables: {
        name: newName,
        targetDate: new Date(newDate).toISOString(),
        additionalInfo: newInfo
      }
    });
    setShowCreateModal(false);
    setNewName(''); setNewDate(''); setNewInfo('');
  };

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this release?")) {
      await deleteRelease({ variables: { id } });
      if (selectedRelease?.id === id) {
        setSelectedRelease(null);
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading releases...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

  const releases = data?.releases || [];

  return (
    <div>
      <div className="header-container">
        <h1 className="title">ReleaseCheck</h1>
        <p className="subtitle">Your all-in-one release checklist tool</p>
      </div>

      <div className="card">
        {selectedRelease ? (
          <div>
            <div className="action-bar">
              <div className="breadcrumb">
                <span className="breadcrumb-link" onClick={() => setSelectedRelease(null)}>All releases</span>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-current">{selectedRelease.name}</span>
              </div>
              <button className="btn btn-danger" onClick={(e) => handleDelete(selectedRelease.id, e)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
            
            <div className="detail-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Release</label>
                  <input type="text" className="form-input" value={detailName} onChange={(e) => setDetailName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-input" value={detailDate} onChange={(e) => setDetailDate(e.target.value)} />
                </div>
              </div>

              <div className="step-list">
                {RELEASE_STEPS.map((step, idx) => (
                  <label key={idx} className="step-item">
                    <input 
                      type="checkbox" 
                      className="step-checkbox" 
                      checked={isChecked(detailSteps, step)}
                      onChange={(e) => {
                        setDetailSteps({
                          ...detailSteps,
                          [step]: e.target.checked
                        });
                      }}
                    />
                    <span className="step-label">{step}</span>
                  </label>
                ))}
              </div>

              <div className="textarea-group">
                <label>Additional remarks / Tasks</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Please enter any other important notes for the release"
                  value={detailInfo}
                  onChange={(e) => setDetailInfo(e.target.value)}
                />
              </div>

              <div className="detail-actions">
                <button className="btn" onClick={handleSaveDetail}>Save ✓</button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="action-bar">
              <div className="breadcrumb">All releases</div>
              <button className="btn" onClick={() => setShowCreateModal(true)}>New release ⊕</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Release</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {releases.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No releases found. Create one.</td>
                  </tr>
                ) : null}
                {releases.map((release: any) => (
                  <tr key={release.id}>
                    <td>{release.name}</td>
                    <td>{formatDate(release.targetDate)}</td>
                    <td>
                      <span className={`badge badge-${release.status.toLowerCase()}`}>
                        {release.status}
                      </span>
                    </td>
                    <td style={{ width: '80px' }}>
                      <button className="table-action-btn" onClick={() => handleView(release)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                    <td style={{ width: '80px' }}>
                      <button className="table-action-btn delete" onClick={(e) => handleDelete(release.id, e)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">New Release</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Name</label>
              <input type="text" className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Version 1.0.1" />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Target Date</label>
              <input type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Additional Info</label>
              <textarea className="form-input" value={newInfo} onChange={(e) => setNewInfo(e.target.value)} rows={3} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
