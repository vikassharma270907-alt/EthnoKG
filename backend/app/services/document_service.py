import io
from typing import Optional
from pypdf import PdfReader
from sqlalchemy.orm import Session
from ..models.document import Document
from ..schemas.document import DocumentCreate

class DocumentService:
    @staticmethod
    def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text.strip())
            return "\n\n".join(text_parts)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF document: {str(e)}")

    @staticmethod
    def create_document(db: Session, doc_in: DocumentCreate) -> Document:
        char_count = len(doc_in.raw_text)
        db_doc = Document(
            title=doc_in.title,
            authors=doc_in.authors,
            publication_year=doc_in.publication_year,
            journal=doc_in.journal,
            doi=doc_in.doi,
            source_url=doc_in.source_url,
            license=doc_in.license or "Open Access",
            document_type=doc_in.document_type or "Research Article",
            raw_text=doc_in.raw_text,
            char_count=char_count
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        return db_doc

    @staticmethod
    def get_document(db: Session, document_id: int) -> Optional[Document]:
        return db.query(Document).filter(Document.id == document_id).first()

    @staticmethod
    def list_documents(db: Session, skip: int = 0, limit: int = 50, query: Optional[str] = None):
        q = db.query(Document)
        if query:
            q = q.filter(
                (Document.title.ilike(f"%{query}%")) |
                (Document.authors.ilike(f"%{query}%")) |
                (Document.journal.ilike(f"%{query}%")) |
                (Document.doi.ilike(f"%{query}%"))
            )
        total = q.count()
        docs = q.order_by(Document.id.desc()).offset(skip).limit(limit).all()
        return docs, total
