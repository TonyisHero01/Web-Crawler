from pickle import TRUE
from sqlalchemy import *
from sqlalchemy.orm import *
engine = create_engine('mysql+mysqlconnector://root:T1509517798w@localhost/tony_76824974')
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
# We will need this for querying
Base.query = db_session.query_property()

class WebPage(Base):
    __tablename__ = "Crawled_Page"
    identifier = Column(Integer, primary_key=True, nullable=False)
    label = Column(String, nullable=False)
    url = Column(String, nullable=False)
    regexp = Column(String, nullable=False)
    tags = relationship(String, back_populates=String)
    active = Column(Boolean, nullable=False)

class Node(Base):
    __tablename__ = "Crawled_Page"
    title = Column(String, nullable=True)
    url = Column(String, nullable=False)
    crawlTime = Column(String, nullable=True)
    links = relationship("Node")
    owner = relationship(WebPage)